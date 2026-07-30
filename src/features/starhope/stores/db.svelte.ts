import Dexie, { type EntityTable } from 'dexie';

export interface LocalUser {
  id: string;
  nickname: string;
  account: string;
  passwordHash: string;
  salt: string;
  avatar?: string;
  createdAt: string;
}

export interface Question {
  id: string;
  userId: string;
  type: 'single' | 'multiple' | 'true-false' | 'essay' | 'fill';
  content: string;
  options?: string[];
  answer: string | string[];
  analysis?: string;
  tags: string[];
  folderId?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  media?: { type: 'image'; data: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  sort: number;
}

export interface PracticeSession {
  id: string;
  userId: string;
  type: 'practice' | 'exam';
  mode: 'realtime' | 'batch';
  questionIds: string[];
  answers: Record<string, string | string[]>;
  results?: Record<string, { correct: boolean; score?: number }>;
  status: 'ongoing' | 'paused' | 'completed';
  startedAt: string;
  completedAt?: string;
  timeLimit?: number;
  passingGrade?: number;
}

export interface AiAgent {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  systemPrompt: string;
  service: 'openai' | 'ollama';
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  createdAt: string;
}

export interface AiMessage {
  id: string;
  agentId: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; data: string; type: string }[];
  timestamp: string;
}

const db = new Dexie('starhope') as Dexie & {
  users: EntityTable<LocalUser, 'id'>;
  questions: EntityTable<Question, 'id'>;
  folders: EntityTable<Folder, 'id'>;
  practiceSessions: EntityTable<PracticeSession, 'id'>;
  aiAgents: EntityTable<AiAgent, 'id'>;
  aiMessages: EntityTable<AiMessage, 'id'>;
};

db.version(1).stores({
  users: 'id, account',
  questions: 'id, userId, folderId, type, difficulty, tags, createdAt',
  folders: 'id, userId, parentId',
  practiceSessions: 'id, userId, type, status',
  aiAgents: 'id, userId',
  aiMessages: 'id, agentId, timestamp',
});

export { db };
