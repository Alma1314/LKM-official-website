<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold">双因素认证 (2FA)</h3>

    <div class="flex items-center justify-between p-3 bg-page-bg rounded-lg gap-3">
      <div>
        <span class="font-medium">TOTP 动态验证码</span>
        <span class="badge badge-xs ml-2" :class="enabled ? 'badge-success' : 'badge-ghost'">
          {{ enabled ? '已开启' : '未开启' }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <AuthStatus v-if="error" type="error" :message="error" class="text-xs" />
        <button v-if="!enabled && !enabling" type="button" class="btn btn-ghost btn-xs" @click="startEnable">
          开启
        </button>
        <button v-else-if="enabled" type="button" class="btn btn-ghost btn-xs text-error" @click="confirmOpen = true">
          关闭
        </button>
      </div>
    </div>

    <!-- 开启流程：输入验证码 -->
    <form v-if="enabling" class="p-3 bg-page-bg rounded-lg space-y-2" @submit.prevent="confirmEnable">
      <p class="text-xs text-text-muted">
        请输入 Authenticator 中的 6 位验证码
        <span v-if="testCode" class="font-mono font-semibold">（测试模式：{{ testCode }}）</span>
      </p>
      <input
        v-model.trim="code"
        type="text"
        inputmode="numeric"
        class="input input-bordered input-sm w-full"
        placeholder="000000"
      />
      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary btn-sm" :disabled="code.length < 6">
          <span v-if="verifying" class="loading loading-spinner loading-xs"></span>
          <template v-else>确认开启</template>
        </button>
        <button type="button" class="btn btn-ghost btn-xs" :disabled="verifying" @click="cancelEnable">取消</button>
      </div>
    </form>

    <!-- 恢复码展示 -->
    <div v-if="recoveryCodes.length" class="p-3 bg-page-bg rounded-lg space-y-2">
      <div class="flex items-center justify-between">
        <span class="font-medium text-sm">恢复码</span>
        <button type="button" class="btn btn-ghost btn-xs" @click="recoveryCodes = []">收起</button>
      </div>
      <ul class="grid grid-cols-2 gap-1 font-mono text-xs">
        <li v-for="rc in recoveryCodes" :key="rc">{{ rc }}</li>
      </ul>
    </div>

    <div>
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        :disabled="!enabled || loadingCodes"
        @click="showRecoveryCodes"
      >
        <span v-if="loadingCodes" class="loading loading-spinner loading-xs"></span>
        <template v-else>查看恢复码</template>
      </button>
    </div>

    <ConfirmDialog
      :open="confirmOpen"
      title="关闭双因素认证"
      message="关闭后，此账户将不再需要动态验证码，请确认你的操作。"
      confirm-text="确认关闭"
      danger
      @confirm="doDisable"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { authApi } from '~/lib/api/modules/auth';
import type { User } from '~/types/auth';
import AuthStatus from '../shared/AuthStatus.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const emit = defineEmits<{
  (e: 'update', user: User): void;
}>();

defineProps<{
  user: User;
}>();

const enabled = ref(false);
const enabling = ref(false);
const verifying = ref(false);
const code = ref('');
const testCode = ref('');
const error = ref('');
const recoveryCodes = ref<string[]>([]);
const loadingCodes = ref(false);
const confirmOpen = ref(false);

async function load() {
  const r = await authApi.getRecoveryCodes();
  if (r.isOk()) {
    enabled.value = !!r.value.two_factor_enabled;
  }
}

async function startEnable() {
  error.value = '';
  enabling.value = true;
  code.value = '';
  const r = await authApi.start2FA();
  if (r.isErr()) {
    error.value = r.error.message;
    enabling.value = false;
    return;
  }
  testCode.value = r.value.test_code ?? '';
  if (testCode.value) code.value = testCode.value;
}

function cancelEnable() {
  enabling.value = false;
  code.value = '';
  testCode.value = '';
}

async function confirmEnable() {
  error.value = '';
  if (code.value.length < 6) {
    error.value = '请输入 6 位验证码';
    return;
  }
  verifying.value = true;
  try {
    const r = await authApi.verify2FAEnable(code.value);
    if (r.isErr()) {
      error.value = r.error.message;
      return;
    }
    enabled.value = true;
    enabling.value = false;
    recoveryCodes.value = r.value.recovery_codes ?? [];
    emit('update', {} as User);
  } finally {
    verifying.value = false;
  }
}

async function showRecoveryCodes() {
  loadingCodes.value = true;
  error.value = '';
  try {
    const r = await authApi.getRecoveryCodes();
    if (r.isErr()) {
      error.value = r.error.message;
      return;
    }
    enabled.value = !!r.value.two_factor_enabled;
    recoveryCodes.value = r.value.recovery_codes ?? [];
  } finally {
    loadingCodes.value = false;
  }
}

async function doDisable() {
  confirmOpen.value = false;
  error.value = '';
  const r = await authApi.disable2FA();
  if (r.isErr()) {
    error.value = r.error.message;
    return;
  }
  enabled.value = false;
  recoveryCodes.value = [];
  emit('update', {} as User);
}

onMounted(load);
</script>
