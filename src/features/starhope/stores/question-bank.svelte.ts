import { db, type Question, type Folder } from './db.svelte';
import { authStore } from './auth.svelte';

class QuestionBankStore {
  questions = $state<Question[]>([]);
  folders = $state<Folder[]>([]);
  currentFolderId = $state<string | null>(null);
  selectedIds = $state<Set<string>>(new Set());
  sortKey = $state<'createdAt' | 'difficulty' | 'type'>('createdAt');
  searchQuery = $state('');

  get filteredQuestions() {
    let list = this.questions;
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(
        (item) => item.content.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }

  async loadQuestions() {
    if (!authStore.currentUser) return;
    let query = db.questions.where('userId').equals(authStore.currentUser.id);
    if (this.currentFolderId) {
      query = query.and((q) => q.folderId === this.currentFolderId);
    }
    this.questions = await query.toArray();
    this.applySort();
  }

  async loadFolders() {
    if (!authStore.currentUser) return;
    this.folders = await db.folders.where('userId').equals(authStore.currentUser.id).toArray();
  }

  async createQuestion(data: Omit<Question, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Question> {
    const question: Question = {
      ...data,
      id: crypto.randomUUID(),
      userId: authStore.currentUser!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.questions.put(question);
    await this.loadQuestions();
    return question;
  }

  async updateQuestion(id: string, data: Partial<Question>) {
    await db.questions.update(id, { ...data, updatedAt: new Date().toISOString() });
    await this.loadQuestions();
  }

  async deleteQuestions(ids: string[]) {
    await db.questions.bulkDelete(ids);
    this.selectedIds = new Set();
    await this.loadQuestions();
  }

  async createFolder(name: string, parentId: string | null = null): Promise<Folder> {
    const folder: Folder = {
      id: crypto.randomUUID(),
      userId: authStore.currentUser!.id,
      name,
      parentId,
      sort: this.folders.length,
    };
    await db.folders.put(folder);
    await this.loadFolders();
    return folder;
  }

  async deleteFolder(id: string) {
    // 将子文件夹和题目移至根目录
    await db.folders.where('parentId').equals(id).modify({ parentId: null });
    await db.questions.where('folderId').equals(id).modify({ folderId: undefined });
    await db.folders.delete(id);
    await this.loadFolders();
    await this.loadQuestions();
  }

  toggleSelect(id: string) {
    const next = new Set(this.selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedIds = next;
  }

  selectAll() {
    this.selectedIds = new Set(this.filteredQuestions.map((q) => q.id));
  }

  clearSelection() {
    this.selectedIds = new Set();
  }

  private applySort() {
    switch (this.sortKey) {
      case 'createdAt':
        this.questions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case 'difficulty':
        this.questions.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case 'type':
        this.questions.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }
  }
}

export const questionBankStore = new QuestionBankStore();
