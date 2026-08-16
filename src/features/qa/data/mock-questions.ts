export interface MockQuestion {
  id: string;
  title: string;
  content: string;
  askerName: string;
  tags: string[];
  bounty: number;
  type: 'general' | 'volunteer';
  status: 'open' | 'resolved';
  viewCount: number;
  answerCount: number;
  createdAt: string;
}

export interface MockAnswer {
  id: string;
  questionId: string;
  authorName: string;
  content: string;
  isAccepted: boolean;
  likeCount: number;
  createdAt: string;
}

export const mockQuestions: MockQuestion[] = [
  {
    id: 'q-1',
    title: 'qaData.questions.q1.title',
    askerName: 'qaData.askers.physicsNewbie',
    content: 'qaData.questions.q1.content',
    tags: ['qaData.tags.physics', 'qaData.tags.quantum', 'qaData.tags.recommendation'],
    bounty: 30,
    type: 'general',
    status: 'resolved',
    viewCount: 560,
    answerCount: 5,
    createdAt: '2026-07-15',
  },
  {
    id: 'q-2',
    title: 'qaData.questions.q2.title',
    askerName: 'qaData.askers.examPrepper',
    content: 'qaData.questions.q2.content',
    tags: ['qaData.tags.math', 'qaData.tags.exam', 'qaData.tags.studyPlan'],
    bounty: 20,
    type: 'general',
    status: 'open',
    viewCount: 890,
    answerCount: 8,
    createdAt: '2026-07-20',
  },
  {
    id: 'q-3',
    title: 'qaData.questions.q3.title',
    askerName: 'qaData.askers.chen',
    content: 'qaData.questions.q3.content',
    tags: ['qaData.tags.volunteer', 'qaData.tags.gaokao', 'qaData.tags.guangdong'],
    bounty: 50,
    type: 'volunteer',
    status: 'resolved',
    viewCount: 1200,
    answerCount: 12,
    createdAt: '2026-07-10',
  },
  {
    id: 'q-4',
    title: 'qaData.questions.q4.title',
    askerName: 'qaData.askers.dataNewbie',
    content: 'qaData.questions.q4.content',
    tags: ['qaData.tags.python', 'qaData.tags.dataProcessing', 'qaData.tags.bigData'],
    bounty: 25,
    type: 'general',
    status: 'open',
    viewCount: 340,
    answerCount: 4,
    createdAt: '2026-07-25',
  },
  {
    id: 'q-5',
    title: 'qaData.questions.q5.title',
    askerName: 'qaData.askers.labWorker',
    content: 'qaData.questions.q5.content',
    tags: ['qaData.tags.chemistry', 'qaData.tags.laboratory', 'qaData.tags.documents'],
    bounty: 15,
    type: 'general',
    status: 'open',
    viewCount: 120,
    answerCount: 2,
    createdAt: '2026-07-26',
  },
];

export const mockAnswers: MockAnswer[] = [
  {
    id: 'a-1',
    questionId: 'q-1',
    authorName: 'qaData.authors.qiyueO',
    content: 'qaData.answers.a1.content',
    isAccepted: true,
    likeCount: 35,
    createdAt: '2026-07-15T12:00:00Z',
  },
  {
    id: 'a-2',
    questionId: 'q-1',
    authorName: 'qaData.authors.physicsTeacher',
    content: 'qaData.answers.a2.content',
    isAccepted: false,
    likeCount: 18,
    createdAt: '2026-07-15T14:00:00Z',
  },
  {
    id: 'a-3',
    questionId: 'q-3',
    authorName: 'qaData.authors.qiyueHua',
    content: 'qaData.answers.a3.content',
    isAccepted: true,
    likeCount: 42,
    createdAt: '2026-07-10T15:00:00Z',
  },
  {
    id: 'a-4',
    questionId: 'q-4',
    authorName: 'qaData.authors.zhang',
    content: 'qaData.answers.a4.content',
    isAccepted: false,
    likeCount: 15,
    createdAt: '2026-07-25T16:00:00Z',
  },
];

export function getQuestionById(id: string): MockQuestion | undefined {
  return mockQuestions.find((q) => q.id === id);
}

export function getAnswersByQuestionId(qid: string): MockAnswer[] {
  return mockAnswers.filter((a) => a.questionId === qid);
}
