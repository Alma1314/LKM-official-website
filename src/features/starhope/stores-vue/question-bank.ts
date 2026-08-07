import { ref, computed } from 'vue';
import { db } from './db';
import { useAuthStore } from './auth';
import type { Question, Folder } from '~/features/starhope/types';

const questions = ref<Question[]>([]);
const folders = ref<Folder[]>([]);
const currentFolderId = ref<string | null>(null);
const selectedIds = ref<Set<string>>(new Set());
const sortKey = ref<'createdAt' | 'difficulty' | 'type'>('createdAt');
const searchQuery = ref('');
const error = ref<string | null>(null);

export function useQuestionBankStore() {
  const auth = useAuthStore();

  const filteredQuestions = computed(() => {
    let list = questions.value;
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase();
      list = list.filter(
        (item) => item.content.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  });

  async function loadQuestions() {
    if (!auth.isLoggedIn.value) return;
    let query = db.questions.where('userId').equals(auth.userId.value!);
    if (currentFolderId.value) query = query.and((q: Question) => q.folderId === currentFolderId.value);
    questions.value = await query.toArray();
    applySort();
  }

  async function loadFolders() {
    if (!auth.isLoggedIn.value) return;
    folders.value = await db.folders.where('userId').equals(auth.userId.value!).toArray();
  }

  async function createQuestion(data: Omit<Question, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const q: Question = {
      ...data,
      id: crypto.randomUUID(),
      userId: String(auth.userId.value!),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.questions.put(q);
    await loadQuestions();
    return q;
  }

  async function updateQuestion(id: string, data: Partial<Question>) {
    await db.questions.update(id, { ...data, updatedAt: new Date().toISOString() });
    await loadQuestions();
  }

  async function deleteQuestions(ids: string[]) {
    await db.questions.bulkDelete(ids);
    selectedIds.value = new Set();
    await loadQuestions();
  }

  async function createFolder(name: string, parentId: string | null = null) {
    const folder: Folder = {
      id: crypto.randomUUID(),
      userId: String(auth.userId.value!),
      name,
      parentId,
      sort: folders.value.length,
    };
    await db.folders.put(folder);
    await loadFolders();
    return folder;
  }

  async function deleteFolder(id: string) {
    await db.folders.where('parentId').equals(id).modify({ parentId: null });
    await db.questions.where('folderId').equals(id).modify({ folderId: undefined });
    await db.folders.delete(id);
    await loadFolders();
    await loadQuestions();
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds.value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selectedIds.value = next;
  }

  function selectAll() {
    selectedIds.value = new Set(filteredQuestions.value.map((q) => q.id));
  }
  function clearSelection() {
    selectedIds.value = new Set();
  }

  function applySort() {
    switch (sortKey.value) {
      case 'createdAt':
        questions.value.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
      case 'difficulty':
        questions.value.sort((a, b) => b.difficulty - a.difficulty);
        break;
      case 'type':
        questions.value.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }
  }

  return {
    questions,
    folders,
    currentFolderId,
    selectedIds,
    sortKey,
    searchQuery,
    error,
    filteredQuestions,
    loadQuestions,
    loadFolders,
    createQuestion,
    updateQuestion,
    deleteQuestions,
    createFolder,
    deleteFolder,
    toggleSelect,
    selectAll,
    clearSelection,
  };
}
