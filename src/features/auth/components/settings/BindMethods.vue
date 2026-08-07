<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">登录方式管理</h3>

    <!-- 邮箱 -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">邮箱</span>
        <span class="text-xs text-text-muted ml-1">{{ bindings.email || '' }}</span>
        <span class="badge badge-xs ml-2" :class="bindings.email ? 'badge-success' : 'badge-ghost'">
          {{ bindings.email ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="errors.email" type="error" :message="errors.email" class="text-xs" />
        <template v-if="pending.email === 'idle'">
          <button v-if="!bindings.email" type="button" class="btn btn-ghost btn-xs" @click="beginBind('email')">
            绑定
          </button>
          <button v-else type="button" class="btn btn-ghost btn-xs text-error" @click="unbind('email')">解绑</button>
        </template>
      </div>
    </div>
    <!-- 邮箱绑定表单 -->
    <form
      v-if="pending.email === 'requesting' || pending.email === 'confirming'"
      class="p-3 bg-page-bg rounded-lg flex gap-2 items-center"
      @submit.prevent="confirmBind('email')"
    >
      <label class="sr-only" for="email-step">邮箱绑定步骤提示</label>
      <div class="flex-1">
        <div v-if="bindingMeta.email?.test_code" class="text-xs text-text-muted mb-1">
          测试模式验证码：<span class="font-mono font-semibold">{{ bindingMeta.email?.test_code }}</span>
        </div>
        <input
          id="email-step"
          v-model.trim="email"
          type="email"
          class="input input-bordered input-sm w-full"
          :placeholder="pending.email === 'requesting' ? '输入邮箱地址' : '输入验证码'"
        />
        <span v-if="errors.email" class="text-xs text-error mt-1 inline-block">{{ errors.email }}</span>
      </div>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="busy.email">
        <span v-if="busy.email" class="loading loading-spinner loading-xs"></span>
        <template v-else>{{ pending.email === 'requesting' ? '发送验证码' : '确认绑定' }}</template>
      </button>
      <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.email" @click="cancelBind('email')">
        取消
      </button>
    </form>

    <!-- 手机号 -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">手机号</span>
        <span class="text-xs text-text-muted ml-1">{{ bindings.phone || '' }}</span>
        <span class="badge badge-xs ml-2" :class="bindings.phone ? 'badge-success' : 'badge-ghost'">
          {{ bindings.phone ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="errors.phone" type="error" :message="errors.phone" class="text-xs" />
        <template v-if="pending.phone === 'idle'">
          <button v-if="!bindings.phone" type="button" class="btn btn-ghost btn-xs" @click="beginBind('phone')">
            绑定
          </button>
          <button v-else type="button" class="btn btn-ghost btn-xs text-error" @click="unbind('phone')">解绑</button>
        </template>
      </div>
    </div>
    <!-- 手机号绑定表单 -->
    <form
      v-if="pending.phone === 'requesting' || pending.phone === 'confirming'"
      class="p-3 bg-page-bg rounded-lg flex gap-2 items-center"
      @submit.prevent="confirmBind('phone')"
    >
      <label class="sr-only" for="phone-step">手机号绑定步骤提示</label>
      <div class="flex-1">
        <div v-if="bindingMeta.phone?.test_code" class="text-xs text-text-muted mb-1">
          测试模式验证码：<span class="font-mono font-semibold">{{ bindingMeta.phone?.test_code }}</span>
        </div>
        <input
          id="phone-step"
          v-model.trim="phone"
          type="tel"
          class="input input-bordered input-sm w-full"
          :placeholder="pending.phone === 'requesting' ? '输入手机号' : '输入验证码'"
        />
        <span v-if="errors.phone" class="text-xs text-error mt-1 inline-block">{{ errors.phone }}</span>
      </div>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="busy.phone">
        <span v-if="busy.phone" class="loading loading-spinner loading-xs"></span>
        <template v-else>{{ pending.phone === 'requesting' ? '发送验证码' : '确认绑定' }}</template>
      </button>
      <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.phone" @click="cancelBind('phone')">
        取消
      </button>
    </form>

    <!-- GitHub -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">GitHub OAuth</span>
        <span class="badge badge-xs ml-2" :class="bindings.github ? 'badge-success' : 'badge-ghost'">
          {{ bindings.github ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="errors.github" type="error" :message="errors.github" class="text-xs" />
        <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.github" @click="toggleGithub">
          <span v-if="busy.github" class="loading loading-spinner loading-xs"></span>
          <template v-else>{{ bindings.github ? '解绑' : '绑定' }}</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, computed, ref } from 'vue';
import { authApi } from '~/lib/api/modules/auth';
import type { BindingState, ChallengeData } from '~/lib/api/modules/auth';
import type { User } from '~/types/auth';
import AuthStatus from '../shared/AuthStatus.vue';

const emit = defineEmits<{
  (e: 'update', user: User): void;
}>();

const props = defineProps<{
  user: User;
}>();

type BindType = 'email' | 'phone';
type StepState = 'idle' | 'requesting' | 'confirming';

const bindings = reactive<BindingState>({ email: null, phone: null, github: false });
const pending = reactive<Record<BindType | 'github', StepState>>({
  email: 'idle',
  phone: 'idle',
  github: 'idle',
});
const bindingMeta = reactive<Record<BindType, Partial<ChallengeData> | null>>({ email: null, phone: null });
const errors = reactive<Record<string, string>>({ email: '', phone: '', github: '' });
const email = ref('');
const phone = ref('');
const contactRef = reactive<Record<BindType, string>>({ email: '', phone: '' });

const busy = computed(() => ({
  email: pending.email !== 'idle',
  phone: pending.phone !== 'idle',
  github: pending.github !== 'idle',
}));

async function load() {
  const r = await authApi.getBindings();
  if (r.isOk()) {
    Object.assign(bindings, r.value);
  }
}

function beginBind(type: BindType) {
  errors[type] = '';
  pending[type] = 'requesting';
  if (type === 'email') email.value = '';
  else phone.value = '';
}

function cancelBind(type: BindType) {
  pending[type] = 'idle';
  bindingMeta[type] = null;
  errors[type] = '';
}

// 第一步：发送验证码（测试模式后端回传 test_code）；第二步：输入验证码确认
async function confirmBind(type: BindType) {
  const input = (type === 'email' ? email.value : phone.value).trim();

  if (pending[type] === 'requesting') {
    errors[type] = '';
    if (!input) {
      errors[type] = type === 'email' ? '请输入邮箱地址' : '请输入手机号';
      return;
    }
    contactRef[type] = input;
    const r = await authApi.bindingRequest(input, type);
    if (r.isErr()) {
      errors[type] = r.error.message;
      return;
    }
    const challenge = r.value;
    bindingMeta[type] = challenge;
    pending[type] = 'confirming';
    // 测试模式自动填入验证码，方便一键确认
    if (challenge.test_code) {
      if (type === 'email') email.value = challenge.test_code;
      else phone.value = challenge.test_code;
    }
    return;
  }

  // confirming：input 内为验证码
  const code = input;
  if (!code) {
    errors[type] = '请输入验证码';
    return;
  }
  const r = await authApi.bindingConfirm(bindingMeta[type]!.transaction_id, code, contactRef[type], type);
  if (r.isErr()) {
    errors[type] = r.error.message;
    return;
  }
  errors[type] = '';
  pending[type] = 'idle';
  bindingMeta[type] = null;
  await load();
  emit('update', props.user);
}

async function unbind(type: BindType) {
  // 调用后端持久化解绑，成功后本地置空并广播
  errors[type] = '';
  try {
    const r = await authApi.unbind(type);
    if (r.isErr()) {
      errors[type] = r.error.message || '解绑失败，请重试';
      return;
    }
    const state = r.value;
    const b = state as BindingState;
    if (type === 'email') bindings.email = b.email ?? null;
    else bindings.phone = b.phone ?? null;
    emit('update', props.user);
  } catch {
    errors[type] = '解绑失败，请重试';
  }
}

// GitHub 绑定：start -> 测试模式短路（test_continue_token）-> callback
async function toggleGithub() {
  errors.github = '';
  if (bindings.github) {
    pending.github = 'requesting';
    try {
      const r = await authApi.unbind('github');
      if (r.isErr()) {
        errors.github = r.error.message || '解绑失败，请重试';
        return;
      }
      const state = r.value as BindingState;
      bindings.github = state.github ?? false;
      emit('update', props.user);
    } catch {
      errors.github = '解绑失败，请重试';
    } finally {
      pending.github = 'idle';
    }
    return;
  }
  pending.github = 'requesting';
  try {
    const start = await authApi.bindingsGithubStart();
    if (start.isErr()) {
      errors.github = start.error.message;
      return;
    }
    const token = start.value.test_continue_token ?? start.value.transaction_id;
    if (!token) {
      errors.github = 'GitHub 授权超时，请重试';
      return;
    }
    const cb = await authApi.bindingsGithubCallback(token);
    if (cb.isErr()) {
      errors.github = cb.error.message;
      return;
    }
    Object.assign(bindings, cb.value);
    emit('update', props.user);
  } finally {
    pending.github = 'idle';
  }
}

onMounted(load);
</script>
