import Dexie, { type EntityTable } from 'dexie';
import type { Question, Folder, PracticeSession, AiAgent, AiMessage } from '~/features/starhope/types';

const db = new Dexie('starhope') as Dexie & {
  questions: EntityTable<Question, 'id'>;
  folders: EntityTable<Folder, 'id'>;
  practiceSessions: EntityTable<PracticeSession, 'id'>;
  aiAgents: EntityTable<AiAgent, 'id'>;
  aiMessages: EntityTable<AiMessage, 'id'>;
};

db.version(2).stores({
  questions: 'id, userId, folderId, type, difficulty, tags, createdAt',
  folders: 'id, userId, parentId',
  practiceSessions: 'id, userId, type, status',
  aiAgents: 'id, userId',
  aiMessages: 'id, agentId, timestamp',
});

export { db };
