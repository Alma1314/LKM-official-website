const DB_NAME = 'lkm-editor-backup';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';
const MAX_SNAPSHOTS = 30;

export interface BackupData {
  id?: number;
  docId: string;
  title: string;
  contentMdx: string;
  editorJson: unknown;
  status: string;
  version: number;
  timestamp: string;
}

export interface BackupMeta {
  id: number;
  docId: string;
  title: string;
  timestamp: string;
}

function openDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
          store.createIndex('docId', 'docId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[backup-store] IndexedDB 打开失败:', request.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[backup-store] IndexedDB 不可用:', err);
      resolve(null);
    }
  });
}

export async function saveBackup(docId: string, data: BackupData): Promise<void> {
  const db = await openDB();
  if (!db) return;
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add({ ...data, docId, timestamp: new Date().toISOString() });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await cleanOldSnapshots(db);
    db.close();
  } catch (err) {
    console.warn('[backup-store] 备份写入失败:', err);
    try { db.close(); } catch { /* ignore */ }
  }
}

async function cleanOldSnapshots(db?: IDBDatabase): Promise<void> {
  const database = db || await openDB();
  if (!database) return;
  try {
    const tx = database.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    const count = await new Promise<number>((resolve, reject) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (count > MAX_SNAPSHOTS) {
      const toRemove = count - MAX_SNAPSHOTS;
      const cursorReq = index.openCursor();
      let removed = 0;
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor && removed < toRemove) {
          store.delete(cursor.primaryKey);
          removed++;
          cursor.continue();
        }
      };
    }
  } catch (err) {
    console.warn('[backup-store] 清理旧备份失败:', err);
  }
}

export async function getBackups(): Promise<BackupMeta[]> {
  const db = await openDB();
  if (!db) return [];
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    const results = await new Promise<BackupData[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return results
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .map((r) => ({ id: r.id!, docId: r.docId, title: r.title, timestamp: r.timestamp }));
  } catch (err) {
    console.warn('[backup-store] 读取备份列表失败:', err);
    try { db.close(); } catch { /* ignore */ }
    return [];
  }
}

export async function getLatestBackup(docId: string): Promise<BackupData | null> {
  const db = await openDB();
  if (!db) return null;
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('docId');
    const request = index.getAll(docId);
    const results = await new Promise<BackupData[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    if (results.length === 0) return null;
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return results[0];
  } catch (err) {
    console.warn('[backup-store] 读取最新备份失败:', err);
    try { db.close(); } catch { /* ignore */ }
    return null;
  }
}

export async function restoreFromBackup(docId: string): Promise<BackupData | null> {
  return getLatestBackup(docId);
}

export function exportAllToJson(docs: BackupData[]): string {
  return JSON.stringify(docs.map(({ id, ...rest }) => rest), null, 2);
}

export function importFromJson(json: string): BackupData[] {
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error('JSON 格式不正确：需要文档数组');
  }
  return parsed.map((item: Record<string, unknown>) => ({
    docId: String(item.docId || ''),
    title: String(item.title || ''),
    contentMdx: String(item.contentMdx || ''),
    editorJson: item.editorJson ?? null,
    status: String(item.status || 'draft'),
    version: Number(item.version || 1),
    timestamp: String(item.timestamp || new Date().toISOString()),
  }));
}
