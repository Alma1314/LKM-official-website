import { db, type Question, type PracticeSession } from './db.svelte';
import { authStore } from './auth.svelte';

export interface PracticeConfig {
  questionIds: string[];
  mode: 'realtime' | 'batch';
  type: 'practice' | 'exam';
  timeLimit?: number;
  passingGrade?: number;
}

class PracticeStore {
  currentSession = $state<PracticeSession | null>(null);
  currentQuestion = $state<Question | null>(null);
  currentIndex = $state(0);
  questions = $state<Question[]>([]);
  elapsedSeconds = $state(0);
  timerInterval = $state<ReturnType<typeof setInterval> | null>(null);

  get totalQuestions() {
    return this.questions.length;
  }

  get progress() {
    if (this.totalQuestions === 0) return 0;
    return this.currentIndex / this.totalQuestions;
  }

  get answeredCount() {
    if (!this.currentSession) return 0;
    return Object.keys(this.currentSession.answers).length;
  }

  get isLastQuestion() {
    return this.currentIndex >= this.totalQuestions - 1;
  }

  get isFirstQuestion() {
    return this.currentIndex <= 0;
  }

  async startPractice(config: PracticeConfig) {
    if (!authStore.currentUser) return;
    this.questions = (await db.questions.bulkGet(config.questionIds)) as Question[];
    this.questions = this.questions.filter(Boolean);

    const session: PracticeSession = {
      id: crypto.randomUUID(),
      userId: authStore.currentUser.id,
      type: config.type,
      mode: config.mode,
      questionIds: this.questions.map((q) => q.id),
      answers: {},
      status: 'ongoing',
      startedAt: new Date().toISOString(),
      timeLimit: config.timeLimit,
      passingGrade: config.passingGrade,
    };
    await db.practiceSessions.put(session);
    this.currentSession = session;
    this.currentIndex = 0;
    this.elapsedSeconds = 0;
    this.loadCurrentQuestion();
    this.startTimer();
  }

  async resumeSession(sessionId: string) {
    const session = await db.practiceSessions.get(sessionId);
    if (!session) return;
    this.currentSession = session;
    this.questions = (await db.questions.bulkGet(session.questionIds)) as Question[];
    this.questions = this.questions.filter(Boolean);
    this.currentIndex = 0;
    this.loadCurrentQuestion();
    this.startTimer();
  }

  setAnswer(answer: string | string[]) {
    if (!this.currentSession || !this.currentQuestion) return;
    this.currentSession.answers[this.currentQuestion.id] = answer;
    if (this.currentSession.mode === 'realtime') {
      this.gradeCurrent();
    }
  }

  private gradeCurrent() {
    if (!this.currentSession || !this.currentQuestion) return;
    const userAnswer = this.currentSession.answers[this.currentQuestion.id];
    const correctAnswer = this.currentQuestion.answer;

    let correct = false;
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      const sorted1 = [...correctAnswer].sort();
      const sorted2 = [...userAnswer].sort();
      correct = sorted1.length === sorted2.length && sorted1.every((v, i) => v === sorted2[i]);
    } else if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
      correct = correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
    }

    if (!this.currentSession.results) this.currentSession.results = {};
    this.currentSession.results[this.currentQuestion.id] = { correct };
  }

  goToQuestion(index: number) {
    if (index < 0 || index >= this.totalQuestions) return;
    this.currentIndex = index;
    this.loadCurrentQuestion();
  }

  nextQuestion() {
    if (!this.isLastQuestion) {
      this.currentIndex++;
      this.loadCurrentQuestion();
    }
  }

  prevQuestion() {
    if (!this.isFirstQuestion) {
      this.currentIndex--;
      this.loadCurrentQuestion();
    }
  }

  async submitExam() {
    if (!this.currentSession) return;
    // 阅卷模式下批量批改所有题目
    if (this.currentSession.mode === 'batch') {
      for (const q of this.questions) {
        const userAnswer = this.currentSession.answers[q.id];
        if (!userAnswer) continue;
        const correctAnswer = q.answer;
        let correct = false;
        if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
          const sorted1 = [...correctAnswer].sort();
          const sorted2 = [...userAnswer].sort();
          correct = sorted1.length === sorted2.length && sorted1.every((v, i) => v === sorted2[i]);
        } else if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
          correct = correctAnswer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
        }
        if (!this.currentSession.results) this.currentSession.results = {};
        this.currentSession.results[q.id] = { correct };
      }
    }

    this.currentSession.status = 'completed';
    this.currentSession.completedAt = new Date().toISOString();
    await db.practiceSessions.put(this.currentSession);
    this.stopTimer();
    return this.currentSession;
  }

  async pauseSession() {
    if (!this.currentSession) return;
    this.currentSession.status = 'paused';
    await db.practiceSessions.put(this.currentSession);
    this.stopTimer();
  }

  getSessionResult() {
    if (!this.currentSession || !this.currentSession.results) return null;
    const results = this.currentSession.results;
    const total = Object.keys(results).length;
    const correct = Object.values(results).filter((r) => r.correct).length;
    return { total, correct, wrong: total - correct, score: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }

  getPassed() {
    if (this.currentSession?.type !== 'exam') return null;
    const result = this.getSessionResult();
    if (!result || !this.currentSession.passingGrade) return null;
    return result.score >= this.currentSession.passingGrade;
  }

  private loadCurrentQuestion() {
    this.currentQuestion = this.questions[this.currentIndex] ?? null;
  }

  private startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      if (this.currentSession?.timeLimit && this.elapsedSeconds >= this.currentSession.timeLimit * 60) {
        this.submitExam();
      }
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  async loadSessions(type?: 'practice' | 'exam') {
    if (!authStore.currentUser) return [];
    let query = db.practiceSessions.where('userId').equals(authStore.currentUser.id);
    if (type) query = query.and((s) => s.type === type);
    return query.reverse().sortBy('startedAt');
  }

  async loadWrongQuestions(): Promise<Question[]> {
    if (!authStore.currentUser) return [];
    const sessions = await db.practiceSessions
      .where('userId')
      .equals(authStore.currentUser.id)
      .filter((s) => s.results !== undefined && s.status === 'completed')
      .toArray();

    const wrongIds = new Set<string>();
    for (const s of sessions) {
      if (!s.results) continue;
      for (const [id, result] of Object.entries(s.results)) {
        if (!result.correct) wrongIds.add(id);
      }
    }

    const questions = (await db.questions.bulkGet([...wrongIds])) as Question[];
    return questions.filter(Boolean);
  }

  reset() {
    this.stopTimer();
    this.currentSession = null;
    this.currentQuestion = null;
    this.questions = [];
    this.currentIndex = 0;
    this.elapsedSeconds = 0;
  }
}

export const practiceStore = new PracticeStore();
