<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">登录方式管理</h3>

    <!-- 邮箱 -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">邮箱</span>
        <span class="text-xs text-text-muted ml-1">{{ boundEmail || '' }}</span>
        <span class="badge badge-xs ml-2" :class="boundEmail ? 'badge-success' : 'badge-ghost'">
          {{ boundEmail ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="errors.email" type="error" :message="errors.email" class="text-xs" />
        <button
          v-if="!boundEmail && pending.email === 'idle'"
          type="button"
          class="btn btn-ghost btn-xs"
          data-testid="bind-email"
          @click="beginBind('email')"
        >
          绑定
        </button>
        <button
          v-else-if="boundEmail"
          type="button"
          class="btn btn-ghost btn-xs text-error"
          @click="
            unbinding = 'email';
            unbindCode = '';
          "
        >
          解绑
        </button>
      </div>
    </div>
    <!-- 邮箱绑定表单（两式：发码 → 确认） -->
    <form
      v-if="pending.email !== 'idle'"
      class="p-3 bg-page-bg rounded-lg flex gap-2 items-center"
      @submit.prevent="onSubmit('email')"
    >
      <div class="flex-1">
        <input
          v-model.trim="email"
          type="email"
          class="input input-bordered input-sm w-full"
          :placeholder="pending.email === 'request' ? '输入邮箱地址' : '输入验证码'"
        />
        <span v-if="errors.email" class="text-xs text-error mt-1 inline-block">{{ errors.email }}</span>
      </div>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="busy.email">
        <span v-if="busy.email" class="loading loading-spinner loading-xs"></span>
        <template v-else>{{ pending.email === 'request' ? '发送验证码' : '确认绑定' }}</template>
      </button>
      <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.email" @click="cancelBind('email')">
        取消
      </button>
    </form>

    <!-- 手机号 -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">手机号</span>
        <span class="text-xs text-text-muted ml-1">{{ boundPhone || '' }}</span>
        <span class="badge badge-xs ml-2" :class="boundPhone ? 'badge-success' : 'badge-ghost'">
          {{ boundPhone ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="errors.phone" type="error" :message="errors.phone" class="text-xs" />
        <button
          v-if="!boundPhone && pending.phone === 'idle'"
          type="button"
          class="btn btn-ghost btn-xs"
          @click="beginBind('phone')"
        >
          绑定
        </button>
        <button
          v-else-if="boundPhone"
          type="button"
          class="btn btn-ghost btn-xs text-error"
          @click="
            unbinding = 'phone';
            unbindCode = '';
          "
        >
          解绑
        </button>
      </div>
    </div>
    <!-- 手机号绑定表单 -->
    <form
      v-if="pending.phone !== 'idle'"
      class="p-3 bg-page-bg rounded-lg flex gap-2 items-center"
      @submit.prevent="onSubmit('phone')"
    >
      <div class="flex-1">
        <input
          v-model.trim="phone"
          type="tel"
          class="input input-bordered input-sm w-full"
          :placeholder="pending.phone === 'request' ? '输入手机号' : '输入验证码'"
        />
        <span v-if="errors.phone" class="text-xs text-error mt-1 inline-block">{{ errors.phone }}</span>
      </div>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="busy.phone">
        <span v-if="busy.phone" class="loading loading-spinner loading-xs"></span>
        <template v-else>{{ pending.phone === 'request' ? '发送验证码' : '确认绑定' }}</template>
      </button>
      <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.phone" @click="cancelBind('phone')">
        取消
      </button>
    </form>

    <!-- GitHub OAuth -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">GitHub OAuth</span>
        <span class="badge badge-xs ml-2" :class="boundGithub ? 'badge-success' : 'badge-ghost'">
          {{ boundGithub ? '已绑定' : '未绑定' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="errors.github" type="error" :message="errors.github" class="text-xs" />
        <button
          v-if="!boundGithub"
          type="button"
          class="btn btn-ghost btn-xs"
          :disabled="busy.github"
          @click="startGithubBind"
        >
          <span v-if="busy.github" class="loading loading-spinner loading-xs"></span>
          <template v-else>绑定</template>
        </button>
        <button
          v-else
          type="button"
          class="btn btn-ghost btn-xs text-error"
          @click="
            unbinding = 'github';
            unbindCode = '';
          "
        >
          解绑
        </button>
      </div>
    </div>

    <!-- 解绑 2FA 验证码输入 -->
    <form v-if="unbinding" class="p-3 bg-page-bg rounded-lg flex gap-2 items-center" @submit.prevent="doUnbind">
      <div class="flex-1">
        <input
          v-model.trim="unbindCode"
          type="text"
          inputmode="numeric"
          class="input input-bordered input-sm w-full"
          placeholder="已开启两步验证，请输入动态验证码"
        />
      </div>
      <button type="submit" class="btn btn-error btn-sm" :disabled="has2FA && unbindCode.length < 6">确认解绑</button>
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        @click="
          unbinding = false;
          unbindCode = '';
        "
      >
        取消
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { authApi } from '~/lib/api/modules/auth';
import type { User } from '~/types/auth';
import AuthStatus from '../shared/AuthStatus.vue';

const emit = defineEmits<{
  (e: 'update', user: User): void;
}>();

const props = defineProps<{
  user: User;
}>();

type BindType = 'email' | 'phone';
type StepState = 'idle' | 'request' | 'confirm';

// 绑定态从 GET /auth/settings 拉取；未加载出结果时回退到 props.user 近似值。
const boundEmail = ref((props.user as { email?: string | null }).email ?? '');
const boundPhone = ref((props.user as { phone?: string | null }).phone ?? '');
const boundGithub = ref(!!(props.user as { github?: boolean }).github);
const has2FA = ref(false);

// 解绑用的当前 TOTP 码输入（2FA 已开启时要求）
const unbinding = ref<false | 'email' | 'phone' | 'github'>(false);
const unbindCode = ref('');

const pending = reactive<Record<BindType, StepState>>({ email: 'idle', phone: 'idle' });
const submitting = reactive<Record<BindType, boolean>>({ email: false, phone: false });
const errors = reactive<Record<string, string>>({ email: '', phone: '', github: '' });
const email = ref('');
const phone = ref('');
const busy = computed(() => ({ email: submitting.email, phone: submitting.phone, github: false }));

function beginBind(type: BindType) {
  errors[type] = '';
  pending[type] = 'request';
  if (type === 'email') email.value = '';
  else phone.value = '';
}

function cancelBind(type: BindType) {
  pending[type] = 'idle';
  submitting[type] = false;
  errors[type] = '';
}

async function onSubmit(type: BindType) {
  const input = (type === 'email' ? email.value : phone.value).trim();
  errors[type] = '';
  submitting[type] = true;
  try {
    if (pending[type] === 'request') {
      if (!input) {
        errors[type] = type === 'email' ? '请输入邮箱地址' : '请输入手机号';
        return;
      }
      const r = type === 'email' ? await authApi.bindEmailRequest(input) : await authApi.bindPhoneRequest(input);
      if (r.isErr()) {
        errors[type] = r.error.message;
        return;
      }
      pending[type] = 'confirm';
      return;
    }

    // confirm：input 为验证码
    const code = input;
    if (!code) {
      errors[type] = '请输入验证码';
      return;
    }
    const contact = type === 'email' ? email.value : phone.value;
    const r =
      type === 'email' ? await authApi.bindEmailVerify(contact, code) : await authApi.bindPhoneVerify(contact, code);
    if (r.isErr()) {
      errors[type] = r.error.message;
      return;
    }
    // 绑定成功：本地记录绑定值
    if (type === 'email') boundEmail.value = contact;
    else boundPhone.value = contact;
    pending[type] = 'idle';
    emit('update', props.user);
  } finally {
    submitting[type] = false;
  }
}

// GitHub 绑定：拿后端授权 URL 并整页跳转（后端绑定回调也会 302 回前端）。
async function startGithubBind() {
  errors.github = '';
  try {
    const r = await authApi.githubBindRedirect();
    if (r.isErr()) {
      errors.github = r.error.message;
      return;
    }
    window.location.assign(r.value.url);
  } catch {
    errors.github = '发起 GitHub 授权失败';
  }
}

// 加载真实绑定态
async function load() {
  const r = await authApi.getSettings();
  if (r.isOk()) {
    boundEmail.value = r.value.email ?? '';
    boundPhone.value = r.value.phone ?? '';
    boundGithub.value = !!r.value.github;
    has2FA.value = !!r.value.has_2fa;
  }
}

// 解绑：若 2FA 已开启则需输入 TOTP 码
async function doUnbind() {
  const type = unbinding.value;
  if (!type) return;
  const key = type === 'email' ? 'email' : type === 'phone' ? 'phone' : 'github';
  errors[key] = '';
  try {
    if (has2FA.value && !unbindCode.value) {
      errors[key] = '已开启两步验证，请输入动态验证码';
      return;
    }
    const r = await authApi.unbind(type, has2FA.value ? unbindCode.value : undefined);
    if (r.isErr()) {
      errors[key] = r.error.message || '解绑失败，请重试';
      return;
    }
    if (type === 'email') boundEmail.value = '';
    else if (type === 'phone') boundPhone.value = '';
    else boundGithub.value = false;
    unbinding.value = false;
    unbindCode.value = '';
    emit('update', props.user);
  } catch {
    errors[key] = '解绑失败，请重试';
  }
}

onMounted(load);
</script>
