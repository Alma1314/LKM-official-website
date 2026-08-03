import { ref, computed } from 'vue';
import { db } from './db';
import { useAuthStore } from './auth';
import type { Question, PracticeSession } from '~/features/starhope/types';

export interface PracticeConfig {
  questionIds: string[];
  mode: 'realtime' | 'batch';
  type: 'practice' | 'exam';
  timeLimit?: number;
  passingGrade?: number;
}

const currentSession = ref<PracticeSession | null>(null);
const currentQuestion = ref<Question | null>(null);
const currentIndex = ref(0);
const questions = ref<Question[]>([]);
const elapsedSeconds = ref(0);
let timerInterval: ReturnType<typeof setInterval> | null = null;
const error = ref<string | null>(null);

export function usePracticeStore() {
  const auth = useAuthStore();

  const totalQuestions = computed(() => questions.value.length);
  const progress = computed(() => (totalQuestions.value === 0 ? 0 : currentIndex.value / totalQuestions.value));
  const answeredCount = computed(() => (currentSession.value ? Object.keys(currentSession.value.answers).length : 0));
  const isLastQuestion = computed(() => currentIndex.value >= totalQuestions.value - 1);
  const isFirstQuestion = computed(() => currentIndex.value <= 0);

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    stopTimer();
    timerInterval = setInterval(() => {
      elapsedSeconds.value++;
      if (currentSession.value?.timeLimit && elapsedSeconds.value >= currentSession.value.timeLimit * 60) {
        submitExam();
      }
    }, 1000);
  }

  function loadCurrentQuestion() {
    currentQuestion.value = questions.value[currentIndex.value] ?? null;
  }

  async function startPractice(config: PracticeConfig) {
    if (!auth.isLoggedIn.value) return;
    questions.value = (await db.questions.bulkGet(config.questionIds)) as Question[];
    questions.value = questions.value.filter(Boolean);
    const session: PracticeSession = {
      id: crypto.randomUUID(),
      userId: auth.userId.value!,
      type: config.type,
      mode: config.mode,
      questionIds: questions.value.map((q) => q.id),
      answers: {},
      status: 'ongoing',
      startedAt: new Date().toISOString(),
      timeLimit: config.timeLimit,
      passingGrade: config.passingGrade,
    };
    await db.practiceSessions.put(session);
    currentSession.value = session;
    currentIndex.value = 0;
    elapsedSeconds.value = 0;
    loadCurrentQuestion();
    startTimer();
  }

  async function resumeSession(sessionId: string) {
    const session = await db.practiceSessions.get(sessionId);
    if (!session) return;
    currentSession.value = session;
    questions.value = (await db.questions.bulkGet(session.questionIds)) as Question[];
    questions.value = questions.value.filter(Boolean);
    currentIndex.value = 0;
    loadCurrentQuestion();
    startTimer();
  }

  function setAnswer(answer: string | string[]) {
    if (!currentSession.value || !currentQuestion.value) return;
    currentSession.value.answers[currentQuestion.value.id] = answer;
    if (currentSession.value.mode === 'realtime') gradeCurrent();
  }

  function gradeCurrent() {
    if (!currentSession.value || !currentQuestion.value) return;
    const userAnswer = currentSession.value.answers[currentQuestion.value.id];
    const correctAnswer = currentQuestion.value.answer;
    let correct = false;
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      const s1 = [...correctAnswer].sort(),
        s2 = [...userAnswer].sort();
      correct = s1.length === s2.length && s1.every((v, i) => v === s2[i]);
    } else if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
      correct = correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    }
    if (!currentSession.value.results) currentSession.value.results = {};
    currentSession.value.results[currentQuestion.value.id] = { correct };
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < totalQuestions.value) {
      currentIndex.value = index;
      loadCurrentQuestion();
    }
  }
  function nextQuestion() {
    if (!isLastQuestion.value) {
      currentIndex.value++;
      loadCurrentQuestion();
    }
  }
  function prevQuestion() {
    if (!isFirstQuestion.value) {
      currentIndex.value--;
      loadCurrentQuestion();
    }
  }

  async function submitExam() {
    if (!currentSession.value) return;
    if (currentSession.value.mode === 'batch') {
      for (const q of questions.value) {
        const ua = currentSession.value.answers[q.id];
        if (!ua) continue;
        let correct = false;
        if (Array.isArray(q.answer) && Array.isArray(ua)) {
          const s1 = [...q.answer].sort(),
            s2 = [...ua].sort();
          correct = s1.length === s2.length && s1.every((v, i) => v === s2[i]);
        } else if (typeof q.answer === 'string' && typeof ua === 'string') {
          correct = q.answer.trim().toLowerCase() === ua.trim().toLowerCase();
        }
        if (!currentSession.value.results) currentSession.value.results = {};
        currentSession.value.results[q.id] = { correct };
      }
    }
    currentSession.value.status = 'completed';
    currentSession.value.completedAt = new Date().toISOString();
    await db.practiceSessions.put(currentSession.value);
    stopTimer();
    return currentSession.value;
  }

  async function pauseSession() {
    if (!currentSession.value) return;
    currentSession.value.status = 'paused';
    await db.practiceSessions.put(currentSession.value);
    stopTimer();
  }

  function getSessionResult() {
    if (!currentSession.value?.results) return null;
    const results = currentSession.value.results;
    const total = Object.keys(results).length;
    const correct = Object.values(results).filter((r) => r.correct).length;
    return { total, correct, wrong: total - correct, score: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }

  function getPassed() {
    if (currentSession.value?.type !== 'exam') return null;
    const result = getSessionResult();
    if (!result || !currentSession.value?.passingGrade) return null;
    return result.score >= currentSession.value.passingGrade;
  }

  async function loadSessions(type?: 'practice' | 'exam') {
    if (!auth.isLoggedIn.value) return [];
    let query = db.practiceSessions.where('userId').equals(auth.userId.value!);
    if (type) query = query.and((s: PracticeSession) => s.type === type);
    return query.reverse().sortBy('startedAt');
  }

  async function loadWrongQuestions(): Promise<Question[]> {
    if (!auth.isLoggedIn.value) return [];
    const all = await db.practiceSessions.where('userId').equals(auth.userId.value!).toArray();
    const sessions = all.filter((s: PracticeSession) => s.results && s.status === 'completed');
    const wrongIds = new Set<string>();
    for (const s of sessions) {
      if (!s.results) continue;
      for (const [id, r] of Object.entries(s.results)) {
        if (!r.correct) wrongIds.add(id);
      }
    }
    const qs = (await db.questions.bulkGet([...wrongIds])) as Question[];
    return qs.filter(Boolean);
  }

  function reset() {
    stopTimer();
    currentSession.value = null;
    currentQuestion.value = null;
    questions.value = [];
    currentIndex.value = 0;
    elapsedSeconds.value = 0;
  }

  return {
    currentSession,
    currentQuestion,
    currentIndex,
    questions,
    elapsedSeconds,
    error,
    totalQuestions,
    progress,
    answeredCount,
    isLastQuestion,
    isFirstQuestion,
    startPractice,
    resumeSession,
    setAnswer,
    goToQuestion,
    nextQuestion,
    prevQuestion,
    submitExam,
    pauseSession,
    getSessionResult,
    getPassed,
    loadSessions,
    loadWrongQuestions,
    reset,
  };
}
