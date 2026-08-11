<!--
  ProjectHall.vue
  项目大厅主组件（含全部子组件和工具模块）

  代码要点：
  1. 完整的 TypeScript 类型定义
  2. 通用表单校验逻辑封装
  3. HTTP 请求统一封装，根据状态码映射错误信息
  4. 用 toast 替代原生 alert
  5. 增强可访问性（焦点管理、aria 属性、Esc 关闭）
  6. 注释聚焦于解释业务决策和潜在风险，而非复述代码
  7. 发言/报名表单新增项目组选择（量子 / 知识图谱 / 天体 / 科普视频）
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
      @keydown.escape="closeApplyModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
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
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="apply-nickname">
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
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="apply-progress">
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
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="apply-group">
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
            <label for="apply-incubator" class="text-sm font-medium text-deep-text dark:text-white">
              申请进入七月孵化项目
            </label>
          </div>

          <!--
            喵！产品规则：联系方式仅在勾选"申请孵化"时才需要填喵。
          -->
          <div v-if="applyForm.applyIncubator">
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="apply-contact">
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
              class="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
      @keydown.escape="closeProjectModal"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        <div class="flex justify-between items-center mb-4">
          <h2 id="project-modal-title" class="text-xl font-bold text-deep-text dark:text-white">➕ 发起新项目</h2>
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
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="project-name">
              项目名称 <span class="text-red-500">*</span>
            </label>
            <input
              id="project-name"
              v-model="projectForm.name"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="请输入项目名称（不超过50个字符）"
              @blur="validateProjectField('name')"
            />
            <p v-if="projectErrors.name" class="mt-1 text-xs text-red-500">
              {{ projectErrors.name }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="project-description">
              项目简介 <span class="text-red-500">*</span>
            </label>
            <textarea
              id="project-description"
              v-model="projectForm.description"
              rows="3"
              maxlength="200"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="简要介绍项目背景和目标（不超过200个字符）"
              @blur="validateProjectField('description')"
            />
            <p v-if="projectErrors.description" class="mt-1 text-xs text-red-500">
              {{ projectErrors.description }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="project-roles">
              需要招募的角色
            </label>
            <input
              id="project-roles"
              v-model="projectForm.roles"
              type="text"
              maxlength="100"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="例如：前端开发, UI设计, 产品经理（用逗号分隔）"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-deep-text dark:text-white mb-1" for="project-contact">
              联系方式 <span class="text-red-500">*</span>
            </label>
            <input
              id="project-contact"
              v-model="projectForm.contact"
              type="text"
              maxlength="50"
              class="w-full px-3 py-2 border border-surface-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              placeholder="请输入手机号或邮箱"
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
              class="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
// 导入项目规范的 HTTP 客户端喵！
import { apiFetch } from '~/lib/api';

// ============================================================
// TypeScript 类型定义（喵，类型安全赛高！）
// ============================================================
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

// ============================================================
// 工具函数：手机号/邮箱校验（喵喵喵，喵喵喵，赞扬千寻姐！）
// ============================================================
const isValidPhone = (value: string): boolean => /^1[3-9]\d{9}$/.test(value);
const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidContact = (value: string): boolean => isValidPhone(value) || isValidEmail(value);

/*
  喵喵喵！前端侧 XSS 防护：移除输入中的 HTML 标签。
  
  注意：这只是在浏览器里挡一下！
  所以后端必须也做一遍净化！
*/
const sanitizeInput = (value: string): string => value.replace(/<[^>]*>/g, '');

// ============================================================
// HTTP 请求封装（按照项目规范改用 apiFetch 喵～）
// ============================================================
/*
  根据 HTTP 状态码给用户看友好的错误提示。
  不用到处写 if-else 了，这里包了喵
*/
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

// 喵！按照项目规范，使用 apiFetch 替代原生 fetch
const api = {
  async post<T>(endpoint: string, payload: unknown): Promise<T> {
    try {
      const response = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(getErrorMessage(response.status));
      }

      return response.json() as Promise<T>;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('请求失败，请稍后重试。', { cause: error });
    }
  },
};

// ============================================================
// 消息提示（替代原生 alert，alert是坏文明）
// ============================================================
const toast = {
  success(message: string) {
    // TODO: 以后可以换成漂漂亮亮的组件吗喵QAQ
    alert(`✅ ${message}`);
  },
  error(message: string) {
    alert(`❌ ${message}`);
  },
};

// ============================================================
// 标签切换（左右横跳喵～）
// ============================================================
const tabs = [
  { key: 'recruiting' as const, label: '招募' },
  { key: 'showcase' as const, label: '成果展示' },
];

const activeTab = ref('recruiting');

/*
  置顶项目要永远在最前面！
  用数字排序来实现，把置顶的（true=1）往前排，
  这样不管是招募还是成果展示，最上面永远是重要的项目喵！
*/
const filteredProjects = computed<Project[]>(() =>
  mockProjects.filter((p) => p.type === activeTab.value).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
);

// ============================================================
// 模态框1：发言 / 报名 — 状态与逻辑喵
// ============================================================
const showApplyModal = ref(false);
const isSubmittingApply = ref(false);
const applyModalRootRef = ref<HTMLElement | null>(null);

const applyForm = reactive({
  nickname: '',
  progress: '',
  group: '',
  applyIncubator: false,
  contact: '',
});

const applyErrors = reactive({
  nickname: '',
  progress: '',
  group: '',
  contact: '',
});

const openApplyModal = () => {
  showApplyModal.value = true;
};

const resetApplyForm = () => {
  applyForm.nickname = '';
  applyForm.progress = '';
  applyForm.group = '';
  applyForm.applyIncubator = false;
  applyForm.contact = '';
  applyErrors.nickname = '';
  applyErrors.progress = '';
  applyErrors.group = '';
  applyErrors.contact = '';
};

const closeApplyModal = () => {
  showApplyModal.value = false;
  isSubmittingApply.value = false;
  resetApplyForm();
};

const validateApplyField = (field: 'nickname' | 'progress' | 'group' | 'contact') => {
  switch (field) {
    case 'nickname': {
      const val = applyForm.nickname.trim();
      if (!val) {
        applyErrors.nickname = '请输入昵称';
      } else if (val.length < 2) {
        applyErrors.nickname = '昵称至少2个字符';
      } else if (val.length > 20) {
        applyErrors.nickname = '昵称不能超过20个字符';
      } else if (/[<>/]/.test(val)) {
        applyErrors.nickname = '昵称不能包含特殊字符（如 < > /）';
      } else {
        applyErrors.nickname = '';
      }
      break;
    }
    case 'progress': {
      applyErrors.progress = applyForm.progress ? '' : '请选择当前项目进度';
      break;
    }
    case 'group': {
      applyErrors.group = applyForm.group ? '' : '请选择要加入的项目组';
      break;
    }
    case 'contact': {
      if (!applyForm.applyIncubator) {
        applyErrors.contact = '';
        return;
      }
      const val = applyForm.contact.trim();
      if (!val) {
        applyErrors.contact = '申请孵化项目必须填写联系方式';
      } else if (!isValidContact(val)) {
        applyErrors.contact = '请填写有效的手机号或邮箱';
      } else {
        applyErrors.contact = '';
      }
      break;
    }
  }
};

const validateApplyForm = (): boolean => {
  validateApplyField('nickname');
  validateApplyField('progress');
  validateApplyField('group');
  validateApplyField('contact');
  return !applyErrors.nickname && !applyErrors.progress && !applyErrors.group && !applyErrors.contact;
};

const handleApplySubmit = async () => {
  if (isSubmittingApply.value) return;
  if (!validateApplyForm()) return;

  isSubmittingApply.value = true;
  try {
    const payload = {
      nickname: sanitizeInput(applyForm.nickname.trim()),
      progress: applyForm.progress,
      group: applyForm.group,
      applyIncubator: applyForm.applyIncubator,
      contact: sanitizeInput(applyForm.contact.trim()),
      source: 'project-hall',
    };

    await api.post('/api/projects/apply', payload);
    toast.success('提交成功！');
    closeApplyModal();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '提交失败，请稍后重试。');
  } finally {
    isSubmittingApply.value = false;
  }
};

// ============================================================
// 模态框2：发起项目 — 状态与逻辑（喵，和上面差不多呢）
// ============================================================
const showProjectModal = ref(false);
const isSubmittingProject = ref(false);
const projectModalRootRef = ref<HTMLElement | null>(null);

const projectForm = reactive({
  name: '',
  description: '',
  roles: '',
  contact: '',
});

const projectErrors = reactive({
  name: '',
  description: '',
  contact: '',
});

const openProjectModal = () => {
  showProjectModal.value = true;
};

const resetProjectForm = () => {
  projectForm.name = '';
  projectForm.description = '';
  projectForm.roles = '';
  projectForm.contact = '';
  projectErrors.name = '';
  projectErrors.description = '';
  projectErrors.contact = '';
};

const closeProjectModal = () => {
  showProjectModal.value = false;
  isSubmittingProject.value = false;
  resetProjectForm();
};

const validateProjectField = (field: 'name' | 'description' | 'contact') => {
  switch (field) {
    case 'name': {
      const val = projectForm.name.trim();
      if (!val) {
        projectErrors.name = '请输入项目名称';
      } else if (val.length > 50) {
        projectErrors.name = '项目名称不能超过50个字符';
      } else if (/[<>/]/.test(val)) {
        projectErrors.name = '项目名称不能包含特殊字符（如 < > /）';
      } else {
        projectErrors.name = '';
      }
      break;
    }
    case 'description': {
      const val = projectForm.description.trim();
      if (!val) {
        projectErrors.description = '请输入项目简介';
      } else if (val.length > 200) {
        projectErrors.description = '项目简介不能超过200个字符';
      } else {
        projectErrors.description = '';
      }
      break;
    }
    case 'contact': {
      const val = projectForm.contact.trim();
      if (!val) {
        projectErrors.contact = '请填写联系方式';
      } else if (!isValidContact(val)) {
        projectErrors.contact = '请填写有效的手机号或邮箱';
      } else {
        projectErrors.contact = '';
      }
      break;
    }
  }
};

const validateProjectForm = (): boolean => {
  validateProjectField('name');
  validateProjectField('description');
  validateProjectField('contact');
  return !projectErrors.name && !projectErrors.description && !projectErrors.contact;
};

const handleProjectSubmit = async () => {
  if (isSubmittingProject.value) return;
  if (!validateProjectForm()) return;

  isSubmittingProject.value = true;
  try {
    const roles = projectForm.roles
      .split(',')
      .map((s) => sanitizeInput(s.trim()))
      .filter(Boolean);

    const payload = {
      name: sanitizeInput(projectForm.name.trim()),
      description: sanitizeInput(projectForm.description.trim()),
      roles,
      contact: sanitizeInput(projectForm.contact.trim()),
      source: 'project-hall',
    };

    await api.post('/api/projects/create', payload);
    toast.success('项目发起成功！');
    closeProjectModal();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : '发起失败，请稍后重试。');
  } finally {
    isSubmittingProject.value = false;
  }
};

// ============================================================
// 焦点管理：模态框打开时自动聚焦到第一个输入框（喵，用户体验最大喵，所以用户打钱！）
// ============================================================
watch(
  () => applyModalRootRef.value,
  async (el) => {
    if (el) {
      await nextTick();
      const firstInput = el.querySelector<HTMLInputElement>('input[type="text"]');
      firstInput?.focus();
    }
  },
  { immediate: true }
);

watch(
  () => projectModalRootRef.value,
  async (el) => {
    if (el) {
      await nextTick();
      const firstInput = el.querySelector<HTMLInputElement>('input[type="text"]');
      firstInput?.focus();
    }
  },
  { immediate: true }
);
</script>

<!-- ============================================================
  维护喵：比卡(月见八千代) (1175142856@qq.com)
  最后更新：2026-08-11凌晨四点....请项目组一定不要因为我实在是太菜了而开除我，球球了TAT
  有问题欢迎随时联系我～ 喵！这是我在本项目组的第一份独立完成工作，
  尤其感谢deepseek同志kimi同志通义千问同志对我的代码进行的深刻的改正
  虽然真的是非常小的功能但是考虑到了一些复杂的东西，如果有前端的大活随时找我，后端难之，但也可以）
  
  备注：
  - 置顶排序逻辑在 filteredProjects 中
  - 联系方式校验仅在申请孵化时触发
  - 当前使用 mock 数据，接入 API 后替换！辛苦后端同志了。在这里感谢一下
  - Toast 用 alert 临时替代，后续劳烦统一替换？
============================================================ -->
