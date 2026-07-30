import { db } from '~/features/starhope/stores/db.svelte';
import type { Question, Folder } from '~/features/starhope/types';
import { authStore } from '~/features/starhope/stores/auth.svelte';

class QuestionBankStore {
  questions = $state<Question[]>([]);
  folders = $state<Folder[]>([]);
  currentFolderId = $state<string | null>(null);
  selectedIds = $state<Set<string>>(new Set());
  sortKey = $state<'createdAt' | 'difficulty' | 'type'>('createdAt');
  searchQuery = $state('');
  error = $state<string | null>(null);

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
    try {
      if (!authStore.isLoggedIn) return;
      let query = db.questions.where('userId').equals(authStore.userId!);
      if (this.currentFolderId) {
        query = query.and((q) => q.folderId === this.currentFolderId);
      }
      this.questions = await query.toArray();
      this.applySort();
    } catch (e) {
      this.error = '加载题目失败';
      console.error('loadQuestions failed:', e);
    }
  }

  async loadFolders() {
    try {
      if (!authStore.isLoggedIn) return;
      this.folders = await db.folders.where('userId').equals(authStore.userId!).toArray();
    } catch (e) {
      this.error = '加载文件夹失败';
      console.error('loadFolders failed:', e);
    }
  }

  async createQuestion(data: Omit<Question, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Question | null> {
    try {
      const question: Question = {
        ...data,
        id: crypto.randomUUID(),
        userId: authStore.userId!,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.questions.put(question);
      await this.loadQuestions();
      return question;
    } catch (e) {
      this.error = '创建题目失败';
      console.error('createQuestion failed:', e);
      return null;
    }
  }

  async updateQuestion(id: string, data: Partial<Question>) {
    try {
      await db.questions.update(id, { ...data, updatedAt: new Date().toISOString() });
      await this.loadQuestions();
    } catch (e) {
      this.error = '更新题目失败';
      console.error('updateQuestion failed:', e);
    }
  }

  async deleteQuestions(ids: string[]) {
    try {
      await db.questions.bulkDelete(ids);
      this.selectedIds = new Set();
      await this.loadQuestions();
    } catch (e) {
      this.error = '删除题目失败';
      console.error('deleteQuestions failed:', e);
    }
  }

  async createFolder(name: string, parentId: string | null = null): Promise<Folder | null> {
    try {
      const folder: Folder = {
        id: crypto.randomUUID(),
        userId: authStore.userId!,
        name,
        parentId,
        sort: this.folders.length,
      };
      await db.folders.put(folder);
      await this.loadFolders();
      return folder;
    } catch (e) {
      this.error = '创建文件夹失败';
      console.error('createFolder failed:', e);
      return null;
    }
  }

  async deleteFolder(id: string) {
    try {
      // 将子文件夹和题目移至根目录
      await db.folders.where('parentId').equals(id).modify({ parentId: null });
      await db.questions.where('folderId').equals(id).modify({ folderId: undefined });
      await db.folders.delete(id);
      await this.loadFolders();
      await this.loadQuestions();
    } catch (e) {
      this.error = '删除文件夹失败';
      console.error('deleteFolder failed:', e);
    }
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
