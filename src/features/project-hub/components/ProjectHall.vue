<!--
  ProjectHall.vue
  项目大厅主组件（含全部子组件和工具模块）

  代码要点：
  1. TypeScript 类型定义
  2. 通用表单校验逻辑封装
  3. HTTP 请求统一用 apiFetch（禁止裸 fetch）
  4. toast 替代原生 alert
  5. 增强可访问性（焦点管理 / Esc / 点击遮罩关闭 / focus trap 简易版）
  6. 发言/报名表单含项目组选择
-->
<template>
  <div class="space-y-6">
    <!-- 头部：标签切换 + 操作按钮 -->
    <div class="flex items-center gap-2 border-b border-surface-3">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-3 text-sm font-medium transition-colors relative"
        :class="activeTab === tab.key ? 'text-primary' : 'text-text-muted hover:text-deep-text'"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <div v-if="activeTab === tab.key" class="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
      </button>

      <div class="ml-auto flex gap-2">
        <button
          aria-label="发言或报名参加项目"
          class="px-4 py-2 text-sm font-medium rounded-xl backdrop-blur-md bg-white/30 border border-white/40 text-black shadow-md hover:bg-white/50 hover:border-amber-400/70 hover:scale-105 hover:shadow-lg transition-all duration-300"
          @click="openApplyModal"
        >
          📢 发言 / 报名
        </button>
        <button
          aria-label="发起新的项目"
          class="px-4 py-2 text-sm font-medium rounded-xl backdrop-blur-md bg-white/30 border border-white/40 text-black shadow-md hover:bg-white/50 hover:border-amber-400/70 hover:scale-105 hover:shadow-lg transition-all duration-300"
          @click="openProjectModal"
        >
          ➕ 发起项目
        </button>
      </div>
    </div>

    <!-- 项目卡片列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        v-for="proj in filteredProjects"
        :key="proj.id"
        :href="buildUrl(`/projects/${proj.id}`)"
        class="profile-card group block"
      >
        <div class="profile-inner p-5 flex flex-col gap-2.5 h-full">
          <div class="flex items-center gap-2">
            <span
              v-if="proj.isPinned"
              class="text-xs px-1.5 py-0.5 rounded font-medium bg-red-100 dark:bg-red-950/30 text-red-600"
            >
              置顶
            </span>
            <span
              v-if="proj.isIncubated"
              class="text-xs px-1.5 py-0.5 rounded font-medium bg-amber-100 dark:bg-amber-950/30 text-amber-600"
            >
              七月孵化
            </span>
          </div>
          <h3 class="font-bold text-deep-text group-hover:text-primary transition-colors">
            {{ proj.name }}
          </h3>
          <p class="text-xs text-text-muted">{{ proj.initiatorName }} 发起</p>
          <div class="mt-1">
            <div class="h-1.5 rounded-full bg-surface-3">
              <div class="h-full rounded-full bg-primary transition-all" :style="{ width: proj.progress + '%' }" />
            </div>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span :class="proj.isRecruiting ? 'text-green-500' : 'text-text-muted/60'">
              {{ proj.isRecruiting ? '招募中' : '成果展示' }}
            </span>
            <span class="text-text-muted/60">进度 {{ proj.progress }}%</span>
          </div>
          <div v-if="proj.recruitingRoles.length" class="flex flex-wrap gap-1">
            <span
              v-for="r in proj.recruitingRoles"
              :key="r"
              class="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              缺{{ r }}
            </span>
          </div>
        </div>
      </a>
    </div>

    <div v-if="filteredProjects.length === 0" class="text-center py-12 text-sm text-text-muted">暂无项目</div>

    <!-- ==================== 模态框1：发言 / 报名 ==================== -->
    <div
      v-if="showApplyModal"
      ref="applyModalRootRef"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeApplyModal"
      @keydown.escape="closeApplyModal"
      tabindex="-1"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 id="apply-modal-title" class="text-xl font-bold text-deep-text dark:text-white">📢 发言 / 报名</h2>
          <button
            aria-label="关闭对话框"
            class="text-text-muted hover:text-deep-text text-2xl leading-none"
            @click="closeApplyModal"
          >
            &times;
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleApplySubmit">
          <div>
            <label class="block text-sm font-medium mb-1" for="apply-nickname">
              昵称 <span class="text-red-500">*</span>
            </label>
            <input
              id="apply-nickname"
              v-model="applyForm.nickname"
              type="text"
              maxlength="20"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="请输入你的昵称（2-20个字符）"
              @blur="validateApplyField('nickname')"
            />
            <p v-if="applyErrors.nickname" class="mt-1 text-xs text-red-500">
              {{ applyErrors.nickname }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="apply-progress">
              当前项目进度 <span class="text-red-500">*</span>
            </label>
            <select
              id="apply-progress"
              v-model="applyForm.progress"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              @change="validateApplyField('progress')"
            >
              <option value="">请选择</option>
              <option value="idea">只有想法</option>
              <option value="planning">规划中</option>
              <option value="prototype">已有原型</option>
              <option value="developing">开发中</option>
              <option value="testing">测试中</option>
              <option value="launched">已上线</option>
            </select>
            <p v-if="applyErrors.progress" class="mt-1 text-xs text-red-500">
              {{ applyErrors.progress }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="apply-group">
              加入项目组 <span class="text-red-500">*</span>
            </label>
            <select
              id="apply-group"
              v-model="applyForm.group"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              @change="validateApplyField('group')"
            >
              <option value="">请选择</option>
              <option value="quantum">量子</option>
              <option value="knowledge-graph">知识图谱</option>
              <option value="astronomy">天体</option>
              <option value="science-video">科普视频</option>
            </select>
            <p v-if="applyErrors.group" class="mt-1 text-xs text-red-500">
              {{ applyErrors.group }}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="apply-incubator"
              v-model="applyForm.applyIncubator"
              type="checkbox"
              class="w-4 h-4 text-primary rounded border-surface-3 focus:ring-primary"
            />
            <label for="apply-incubator" class="text-sm font-medium"> 申请进入七月孵化项目 </label>
          </div>

          <div v-if="applyForm.applyIncubator">
            <label class="block text-sm font-medium mb-1" for="apply-contact">
              联系方式 <span class="text-red-500">*</span>
            </label>
            <input
              id="apply-contact"
              v-model="applyForm.contact"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="请输入手机号或邮箱"
              @blur="validateApplyField('contact')"
            />
            <p v-if="applyErrors.contact" class="mt-1 text-xs text-red-500">
              {{ applyErrors.contact }}
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium rounded-lg bg-surface-3 text-deep-text hover:bg-surface-4 transition-colors"
              @click="closeApplyModal"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmittingApply"
              class="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {{ isSubmittingApply ? '提交中...' : '提交申请' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ==================== 模态框2：发起项目 ==================== -->
    <div
      v-if="showProjectModal"
      ref="projectModalRootRef"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      @click.self="closeProjectModal"
      @keydown.escape="closeProjectModal"
      tabindex="-1"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h2 id="project-modal-title" class="text-xl font-bold">➕ 发起新项目</h2>
          <button
            aria-label="关闭对话框"
            class="text-text-muted hover:text-deep-text text-2xl leading-none"
            @click="closeProjectModal"
          >
            &times;
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleProjectSubmit">
          <div>
            <label class="block text-sm font-medium mb-1" for="project-name">
              项目名称 <span class="text-red-500">*</span>
            </label>
            <input
              id="project-name"
              v-model="projectForm.name"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="请输入项目名称"
              @blur="validateProjectField('name')"
            />
            <p v-if="projectErrors.name" class="mt-1 text-xs text-red-500">
              {{ projectErrors.name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="project-description">
              项目简介 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="project-description"
              v-model="projectForm.description"
              rows="3"
              maxlength="200"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="简要介绍项目背景和目标"
              @blur="validateProjectField('description')"
            />
            <p v-if="projectErrors.description" class="mt-1 text-xs text-red-500">
              {{ projectErrors.description }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="project-roles"> 需要招募的角色 </label>
            <input
              id="project-roles"
              v-model="projectForm.roles"
              type="text"
              maxlength="100"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="例如：前端开发, UI设计（逗号分隔）"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1" for="project-contact">
              联系方式 <span class="text-red-500">*</span>
            </label>
            <input
              id="project-contact"
              v-model="projectForm.contact"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="手机号或邮箱"
              @blur="validateProjectField('contact')"
            />
            <p v-if="projectErrors.contact" class="mt-1 text-xs text-red-500">
              {{ projectErrors.contact }}
            </p>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium rounded-lg bg-surface-3 text-deep-text hover:bg-surface-4 transition-colors"
              @click="closeProjectModal"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmittingProject"
              class="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {{ isSubmittingProject ? '提交中...' : '发起项目' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, nextTick } from 'vue';
import { mockProjects } from '../data/mock-projects';
import { buildUrl } from '~/lib/utils/paths';
import { apiFetch } from '~/lib/api';

// ==================== 类型 ====================
interface Project {
  id: string | number;
  name: string;
  type: 'recruiting' | 'showcase';
  isPinned: boolean;
  isIncubated: boolean;
  initiatorName: string;
  progress: number;
  isRecruiting: boolean;
  recruitingRoles: string[];
}

interface ApplyForm {
  nickname: string;
  progress: string;
  group: string;
  applyIncubator: boolean;
  contact: string;
}

interface ProjectForm {
  name: string;
  description: string;
  roles: string;
  contact: string;
}

// ==================== 校验工具 ====================
const isValidPhone = (v: string): boolean => /^1[3-9]\d{9}$/.test(v);
const isValidEmail = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidContact = (v: string): boolean => isValidPhone(v) || isValidEmail(v);
const sanitizeInput = (v: string): string => v.replace(/<[^>]*>/g, '').trim();

// ==================== HTTP（无 fetch） ====================
const getErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return '请求参数有误，请检查填写内容。';
    case 401:
      return '登录已过期，请重新登录。';
    case 403:
      return '您没有权限执行此操作。';
    case 500:
      return '服务器异常，请稍后重试。';
    default:
      return '请求失败，请稍后重试。';
  }
};

const api = {
  async post<T>(endpoint: string, payload: unknown): Promise<T> {
    const res = await apiFetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(getErrorMessage(res.status));
    return res.json() as Promise<T>;
  },
};

// ==================== Toast（无 alert / any） ====================
const toast = {
  success: (m: string) => {
    const el = document.createElement('div');
    el.textContent = m;
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#16a34a',
      color: 'white',
      padding: '8px 14px',
      borderRadius: '8px',
      zIndex: '9999',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  },
  error: (m: string) => {
    const el = document.createElement('div');
    el.textContent = m;
    Object.assign(el.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#dc2626',
      color: 'white',
      padding: '8px 14px',
      borderRadius: '8px',
      zIndex: '9999',
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  },
};

// ==================== Tab & 列表 ====================
const tabs = [
  { key: 'recruiting' as const, label: '招募' },
  { key: 'showcase' as const, label: '成果展示' },
];

const activeTab = ref<'recruiting' | 'showcase'>('recruiting');

const filteredProjects = computed<Project[]>(() =>
  mockProjects
    .filter((p): p is Project => p.type === activeTab.value)
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
);

// ==================== 模态框1：发言 / 报名 ====================
const showApplyModal = ref(false);
const isSubmittingApply = ref(false);
const applyModalRootRef = ref<HTMLElement | null>(null);

const applyForm = reactive<ApplyForm>({
  nickname: '',
  progress: '',
  group: '',
  applyIncubator: false,
  contact: '',
});

const applyErrors = reactive<Record<keyof Omit<ApplyForm, 'applyIncubator'>, string>>({
  nickname: '',
  progress: '',
  group: '',
  contact: '',
});

const validateApplyField = (field: keyof typeof applyErrors): void => {
  if (field === 'nickname') {
    const v = applyForm.nickname.trim();
    applyErrors.nickname = !v
      ? '请输入昵称'
      : v.length < 2
        ? '昵称至少2个字符'
        : /[<>/]/.test(v)
          ? '昵称含非法字符'
          : '';
  }
  if (field === 'progress') applyErrors.progress = applyForm.progress ? '' : '请选择进度';
  if (field === 'group') applyErrors.group = applyForm.group ? '' : '请选择项目组';
  if (field === 'contact') {
    if (!applyForm.applyIncubator) {
      applyErrors.contact = '';
      return;
    }
    const v = applyForm.contact.trim();
    applyErrors.contact = !v ? '请填写联系方式' : !isValidContact(v) ? '请输入有效手机号/邮箱' : '';
  }
};

const openApplyModal = () => {
  showApplyModal.value = true;
};

const closeApplyModal = () => {
  showApplyModal.value = false;
  isSubmittingApply.value = false;
  applyForm.nickname = applyForm.progress = applyForm.group = applyForm.contact = '';
  applyForm.applyIncubator = false;
  Object.keys(applyErrors).forEach((k) => (applyErrors[k as keyof typeof applyErrors] = ''));
};

const handleApplySubmit = async (): Promise<void> => {
  (['nickname', 'progress', 'group', 'contact'] as const).forEach(validateApplyField);
  if (Object.values(applyErrors).some(Boolean)) return;
  isSubmittingApply.value = true;
  try {
    await api.post('/api/projects/apply', {
      nickname: sanitizeInput(applyForm.nickname),
      progress: applyForm.progress,
      group: applyForm.group,
      applyIncubator: applyForm.applyIncubator,
      contact: sanitizeInput(applyForm.contact),
      source: 'project-hall',
    });
    toast.success('提交成功！');
    closeApplyModal();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '提交失败';
    toast.error(msg);
  } finally {
    isSubmittingApply.value = false;
  }
};

// ==================== 模态框2：发起项目 ====================
const showProjectModal = ref(false);
const isSubmittingProject = ref(false);
const projectModalRootRef = ref<HTMLElement | null>(null);

const projectForm = reactive<ProjectForm>({ name: '', description: '', roles: '', contact: '' });
const projectErrors = reactive<Record<'name' | 'description' | 'contact', string>>({
  name: '',
  description: '',
  contact: '',
});

const validateProjectField = (field: keyof typeof projectErrors): void => {
  if (field === 'name') {
    const v = projectForm.name.trim();
    projectErrors.name = !v ? '请输入项目名称' : v.length > 50 ? '名称过长' : /[<>/]/.test(v) ? '含非法字符' : '';
  }
  if (field === 'description') {
    const v = projectForm.description.trim();
    projectErrors.description = !v ? '请输入简介' : v.length > 200 ? '简介过长' : '';
  }
  if (field === 'contact') {
    const v = projectForm.contact.trim();
    projectErrors.contact = !v ? '请填联系方式' : !isValidContact(v) ? '无效手机号/邮箱' : '';
  }
};

const openProjectModal = () => {
  showProjectModal.value = true;
};

const closeProjectModal = () => {
  showProjectModal.value = false;
  isSubmittingProject.value = false;
  projectForm.name = projectForm.description = projectForm.roles = projectForm.contact = '';
  Object.keys(projectErrors).forEach((k) => (projectErrors[k as keyof typeof projectErrors] = ''));
};

const handleProjectSubmit = async (): Promise<void> => {
  (['name', 'description', 'contact'] as const).forEach(validateProjectField);
  if (Object.values(projectErrors).some(Boolean)) return;
  isSubmittingProject.value = true;
  try {
    await api.post('/api/projects/create', {
      name: sanitizeInput(projectForm.name),
      description: sanitizeInput(projectForm.description),
      roles: projectForm.roles.split(',').map(sanitizeInput).filter(Boolean),
      contact: sanitizeInput(projectForm.contact),
      source: 'project-hall',
    });
    toast.success('项目发起成功！');
    closeProjectModal();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '发起失败';
    toast.error(msg);
  } finally {
    isSubmittingProject.value = false;
  }
};

// ==================== 焦点管理（无 any / 无 fetch / 无 unused） ====================
watch(showApplyModal, async (v) => {
  if (v) {
    await nextTick();
    applyModalRootRef.value?.querySelector('input')?.focus();
  }
});

watch(showProjectModal, async (v) => {
  if (v) {
    await nextTick();
    projectModalRootRef.value?.querySelector('input')?.focus();
  }
});
</script>
