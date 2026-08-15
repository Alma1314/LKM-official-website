<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">{{ t('settings.bind.title') }}</h3>

    <!-- 邮箱 -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">{{ t('settings.bind.email') }}</span>
        <span class="text-xs text-text-muted ml-1">{{ boundEmail || '' }}</span>
        <span class="badge badge-xs ml-2" :class="boundEmail ? 'badge-success' : 'badge-ghost'">
          {{ boundEmail ? t('settings.bind.bound') : t('settings.bind.notBound') }}
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
          {{ t('settings.bind.bind') }}
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
          {{ t('settings.bind.unbind') }}
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
          :placeholder="
            pending.email === 'request' ? t('settings.bind.emailPlaceholder') : t('settings.bind.codePlaceholder')
          "
        />
        <span v-if="errors.email" class="text-xs text-error mt-1 inline-block">{{ errors.email }}</span>
      </div>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="busy.email">
        <span v-if="busy.email" class="loading loading-spinner loading-xs"></span>
        <template v-else>{{
          pending.email === 'request' ? t('settings.bind.sendCode') : t('settings.bind.confirmBind')
        }}</template>
      </button>
      <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.email" @click="cancelBind('email')">
        {{ t('common.cancel') }}
      </button>
    </form>

    <!-- 手机号 -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">{{ t('settings.bind.phone') }}</span>
        <span class="text-xs text-text-muted ml-1">{{ boundPhone || '' }}</span>
        <span class="badge badge-xs ml-2" :class="boundPhone ? 'badge-success' : 'badge-ghost'">
          {{ boundPhone ? t('settings.bind.bound') : t('settings.bind.notBound') }}
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
          {{ t('settings.bind.bind') }}
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
          {{ t('settings.bind.unbind') }}
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
          :placeholder="
            pending.phone === 'request' ? t('settings.bind.phonePlaceholder') : t('settings.bind.codePlaceholder')
          "
        />
        <span v-if="errors.phone" class="text-xs text-error mt-1 inline-block">{{ errors.phone }}</span>
      </div>
      <button type="submit" class="btn btn-primary btn-sm" :disabled="busy.phone">
        <span v-if="busy.phone" class="loading loading-spinner loading-xs"></span>
        <template v-else>{{
          pending.phone === 'request' ? t('settings.bind.sendCode') : t('settings.bind.confirmBind')
        }}</template>
      </button>
      <button type="button" class="btn btn-ghost btn-xs" :disabled="busy.phone" @click="cancelBind('phone')">
        {{ t('common.cancel') }}
      </button>
    </form>

    <!-- GitHub OAuth -->
    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">GitHub OAuth</span>
        <span class="badge badge-xs ml-2" :class="boundGithub ? 'badge-success' : 'badge-ghost'">
          {{ boundGithub ? t('settings.bind.bound') : t('settings.bind.notBound') }}
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
          <template v-else>{{ t('settings.bind.bind') }}</template>
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
          {{ t('settings.bind.unbind') }}
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
          :placeholder="t('settings.bind.enterTOTP')"
        />
      </div>
      <button type="submit" class="btn btn-error btn-sm" :disabled="has2FA && unbindCode.length < 6">
        {{ t('settings.bind.confirmUnbind') }}
      </button>
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        @click="
          unbinding = false;
          unbindCode = '';
        "
      >
        {{ t('common.cancel') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { authApi } from '~/lib/api/modules/auth';
import { t } from '~/lib/i18n';
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
        errors[type] = type === 'email' ? t('settings.bind.enterEmail') : t('settings.bind.enterPhone');
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
      errors[type] = t('settings.bind.enterCode');
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
    errors.github = t('settings.bind.githubFail');
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
      errors[key] = t('settings.bind.enterTOTP');
      return;
    }
    const r = await authApi.unbind(type, has2FA.value ? unbindCode.value : undefined);
    if (r.isErr()) {
      errors[key] = r.error.message || t('settings.bind.unbindFail');
      return;
    }
    if (type === 'email') boundEmail.value = '';
    else if (type === 'phone') boundPhone.value = '';
    else boundGithub.value = false;
    unbinding.value = false;
    unbindCode.value = '';
    emit('update', props.user);
  } catch {
    errors[key] = t('settings.bind.unbindFail');
  }
}

onMounted(load);
</script>
