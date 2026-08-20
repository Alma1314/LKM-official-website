<template>
  <component
    :is="mode === 'modal' ? 'div' : AuthShell"
    :max-width="mode === 'modal' ? undefined : '440px'"
    :class="mode === 'modal' ? 'w-full' : undefined"
  >
    <AuthCard
      :title="
        flow.loggedIn
          ? t('auth.login.success')
          : flow.mode === '2fa'
            ? t('auth.login.twoFactor')
            : t('auth.login.title')
      "
      :subtitle="t('auth.login.subtitle')"
      :mode="mode"
    >
      <!-- 登录成功态：停留在登录卡片，不自动跳转 -->
      <div v-if="flow.loggedIn" class="text-center space-y-4 py-4">
        <div class="flex justify-center">
          <svg
            class="w-14 h-14 text-success"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p class="text-sm text-text-muted">
          {{
            t("auth.login.welcomeBack", {
              name: flow.account || t("auth.login.user"),
            })
          }}
        </p>
      </div>

      <!-- 未登录：登录方式切换等 -->
      <template v-else>
        <!-- 登录方式切换 -->
        <AuthSegmentedControl
          v-if="flow.mode === 'password' || flow.mode === 'code'"
          :options="segmentedOptions"
          :model-value="flow.mode"
          @update:model-value="flow.mode = $event as LoginMode"
          class="mb-6"
        />

        <!-- 状态提示 -->
        <AuthStatus
          v-if="flow.error"
          type="error"
          class="mb-4"
          :message="flow.error"
        />
        <AuthStatus
          v-else-if="flow.successMessage"
          type="success"
          class="mb-4"
          :message="flow.successMessage"
        />

        <!-- 密码登录 -->
        <form
          v-if="flow.mode === 'password'"
          class="space-y-4"
          @submit.prevent="flow.submitPassword()"
        >
          <AuthField
            :label="t('auth.login.accountLabel')"
            :placeholder="t('auth.login.accountPlaceholder')"
            autocomplete="username"
            v-model="flow.account"
          />
          <AuthField
            :label="t('auth.login.passwordLabel')"
            type="password"
            :placeholder="t('auth.login.passwordPlaceholder')"
            autocomplete="current-password"
            v-model="flow.password"
          />
          <div class="flex justify-end">
            <a
              :href="getAuthPath('account/recovery')"
              class="text-sm text-primary font-semibold hover:underline"
            >
              {{ t("auth.login.forgotPassword") }}
            </a>
          </div>
          <button
            type="submit"
            class="btn btn-primary w-full active:scale-[0.98] transition-transform"
            :disabled="flow.loading"
          >
            <span
              v-if="flow.loading"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else>{{ t("auth.login.title") }}</span>
          </button>
        </form>

        <!-- 验证码登录 -->
        <form
          v-else-if="flow.mode === 'code'"
          class="space-y-4"
          @submit.prevent="flow.submitCode()"
        >
          <AuthField
            :label="t('auth.login.emailOrPhone')"
            :placeholder="t('auth.login.emailOrPhonePlaceholder')"
            v-model="flow.account"
          />
          <div>
            <VerificationCodeField
              id="login-code"
              v-model="flow.code"
              :error="flow.error ?? undefined"
            />
          </div>
          <button
            type="button"
            class="btn btn-outline w-full"
            :disabled="flow.countdownRunning || flow.loading"
            @click="flow.requestCode()"
          >
            <span v-if="!flow.countdownRunning">{{
              t("auth.login.getCode")
            }}</span>
            <span v-else>{{
              t("auth.login.resendCode", { count: flow.countdown })
            }}</span>
          </button>
          <button
            type="submit"
            class="btn btn-primary w-full active:scale-[0.98] transition-transform"
            :disabled="flow.loading || flow.code.length < 6"
          >
            <span
              v-if="flow.loading"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else>{{ t("auth.login.title") }}</span>
          </button>
        </form>

        <!-- 其他登录方式 -->
        <template v-if="flow.mode === 'password' || flow.mode === 'code'">
          <div class="my-6 flex items-center gap-3">
            <div class="h-px flex-1 bg-[var(--surface-3)]"></div>
            <span class="text-xs text-text-muted">{{
              t("auth.login.otherMethods")
            }}</span>
            <div class="h-px flex-1 bg-[var(--surface-3)]"></div>
          </div>
          <div class="space-y-3">
            <AuthMethodButton
              :label="t('auth.login.githubLogin')"
              @click="flow.startGithub()"
              :disabled="flow.loading"
            />
            <AuthMethodButton
              :label="t('auth.login.magicLink')"
              @click="flow.startMagic()"
              :disabled="flow.loading"
            />
            <AuthMethodButton
              :label="t('auth.login.passkey')"
              @click="flow.startPasskey()"
              :disabled="flow.loading"
            />
          </div>
        </template>

        <!-- Magic 态：发送后提示 + 在当前设备继续 -->
        <div v-else-if="flow.mode === 'magic'" class="space-y-4">
          <AuthStatus
            v-if="flow.magicSent"
            type="info"
            :message="t('auth.login.magicSent')"
          />
          <p class="text-sm text-text-muted">
            {{ t("auth.login.magicNoEmail") }}
          </p>
          <button
            type="button"
            class="btn btn-outline w-full"
            :disabled="flow.loading"
            @click="flow.continueMagic()"
          >
            <span
              v-if="flow.loading"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else>{{ t("auth.login.continueOnDevice") }}</span>
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-sm w-full"
            @click="flow.reset()"
          >
            {{ t("auth.login.backToLogin") }}
          </button>
        </div>

        <!-- GitHub 态：正在跳转到真实授权页 -->
        <div v-else-if="flow.mode === 'github'" class="space-y-4">
          <AuthStatus
            v-if="!flow.loading"
            type="info"
            :message="t('auth.login.redirectingGithub')"
          />
          <button type="button" class="btn btn-outline w-full" disabled>
            <span class="loading loading-spinner loading-sm"></span>
            {{ t("auth.login.redirecting") }}
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-sm w-full"
            @click="flow.reset()"
          >
            {{ t("auth.login.backToLogin") }}
          </button>
        </div>

        <!-- Passkey 态 -->
        <div v-else-if="flow.mode === 'passkey'" class="space-y-4">
          <AuthStatus
            v-if="!flow.loading"
            type="info"
            :message="t('auth.login.passkeyVerifying')"
          />
          <button type="button" class="btn btn-outline w-full" disabled>
            {{ t("auth.login.waitingDevice") }}
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-sm w-full"
            @click="flow.reset()"
          >
            {{ t("auth.login.backToLogin") }}
          </button>
        </div>

        <!-- 2FA 态 -->
        <form
          v-else-if="flow.mode === '2fa'"
          class="space-y-4"
          @submit.prevent="flow.submit2FA(flow.code)"
        >
          <VerificationCodeField
            id="login-2fa"
            v-model="flow.code"
            :error="flow.error ?? undefined"
          />
          <button
            type="submit"
            class="btn btn-primary w-full active:scale-[0.98] transition-transform"
            :disabled="flow.loading"
          >
            <span
              v-if="flow.loading"
              class="loading loading-spinner loading-sm"
            ></span>
            <span v-else>{{ t("common.verify") }}</span>
          </button>
          <button
            type="button"
            class="btn btn-ghost btn-sm w-full"
            @click="flow.reset()"
          >
            {{ t("auth.login.backToLogin") }}
          </button>
        </form>

        <!-- 强制 2FA 设置态（管理员等 setup_required 场景） -->
        <div v-else-if="flow.mode === '2fa_setup'" class="space-y-4">
          <AuthStatus
            v-if="flow.error"
            type="error"
            :message="flow.error"
          />
          <!-- 完成设置：展示恢复码，用户确认保存后进入成功态 -->
          <template v-if="flow.setup_recovery_ready">
            <p class="text-sm text-text-muted text-center">
              {{ t("settings.2fa.recoveryHint") }}
            </p>
            <div class="bg-base-200 rounded-xl p-4 space-y-2">
              <p
                v-for="rc in flow.setup_recovery_codes"
                :key="rc"
                class="font-mono text-center text-sm"
              >
                {{ rc }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-primary w-full active:scale-[0.98] transition-transform"
              @click="flow.confirmSetupRecovery()"
            >
              {{ t("auth.twoFactor.done") }}
            </button>
          </template>
          <!-- 二维码 + 验证码录入 -->
          <form
            v-else
            @submit.prevent="flow.complete2FASetup(flow.code)"
            class="space-y-4"
          >
            <div v-if="flow.setup_qr_url" class="flex justify-center">
              <img
                :src="flow.setup_qr_url"
                :alt="t('settings.2fa.qrAlt')"
                class="w-48 h-48 rounded-xl"
              />
            </div>
            <p v-else class="text-sm text-text-muted text-center">
              {{ t("settings.2fa.scanHint") }}
            </p>
            <VerificationCodeField
              id="login-2fa-setup"
              v-model="flow.code"
              :error="flow.error ?? undefined"
            />
            <button
              type="submit"
              class="btn btn-primary w-full active:scale-[0.98] transition-transform"
              :disabled="flow.loading"
            >
              <span
                v-if="flow.loading"
                class="loading loading-spinner loading-sm"
              ></span>
              <span v-else>{{ t("auth.twoFactor.verify") }}</span>
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm w-full"
              @click="flow.reset()"
            >
              {{ t("auth.login.backToLogin") }}
            </button>
          </form>
        </div>

        <!-- 底部注册入口 -->
        <p class="mt-6 text-center text-[13px] text-text-muted">
          {{ t("auth.login.noAccount") }}
          <button
            type="button"
            class="text-primary font-semibold hover:underline"
            @click="switchToRegister"
          >
            {{ t("auth.login.signUpNow") }}
          </button>
        </p>
      </template>
    </AuthCard>
  </component>
</template>

<script setup lang="ts">
import {
  useLoginFlow,
  type LoginMode,
} from "~/features/auth/composables/useLoginFlow";
import { getAuthPath } from "~/features/auth/constants/auth-paths";
import { t } from "~/lib/i18n";
import AuthShell from "../shared/AuthShell.vue";
import AuthCard from "../shared/AuthCard.vue";
import AuthSegmentedControl from "../shared/AuthSegmentedControl.vue";
import AuthField from "../shared/AuthField.vue";
import AuthStatus from "../shared/AuthStatus.vue";
import AuthMethodButton from "../shared/AuthMethodButton.vue";
import VerificationCodeField from "../shared/VerificationCodeField.vue";

withDefaults(defineProps<{ mode?: "page" | "modal" }>(), { mode: "page" });

const flow = useLoginFlow({
  // 登录成功后在卡片内显示「登录成功」，不自动跳转（flow.loggedIn 驱动成功视图）
  redirect: "",
  onSuccess: () => {
    // 不导航、不关闭：由 flow.loggedIn 切换到成功画面
  },
});

const segmentedOptions = [
  { key: "password", label: t("auth.login.passwordLogin") },
  { key: "code", label: t("auth.login.codeLogin") },
];

function switchToRegister() {
  window.dispatchEvent(new CustomEvent("close-auth-modal"));
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { view: "register" } }),
    );
  }, 150);
}
</script>
