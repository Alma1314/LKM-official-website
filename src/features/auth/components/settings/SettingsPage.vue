<template>
  <ProtectedRoute>
    <div class="relative min-h-[calc(100vh-12rem)] px-4 py-8">
      <div class="max-w-2xl mx-auto space-y-6">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-semibold mb-2">账户设置</h1>
          <p class="text-sm text-text-muted">管理你的个人资料和安全设置</p>
        </div>

        <div v-if="message" class="alert alert-success text-sm">{{ message }}</div>

        <!-- Avatar + nickname -->
        <div class="rounded-2xl bg-card-bg shadow-xl border border-surface-3 p-6">
          <div class="flex items-center gap-5">
            <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {{ avatarLetter }}
            </div>
            <div class="flex-1">
              <div class="text-lg font-semibold">{{ state.user?.nickname || state.user?.username }}</div>
              <div class="text-sm text-text-muted">@{{ state.user?.username }}</div>
              <span class="badge badge-sm mt-1" :class="levelBadgeClass">{{ levelLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Edit nickname -->
        <div class="rounded-2xl bg-card-bg shadow-xl border border-surface-3 p-6 space-y-4">
          <h3 class="text-lg font-semibold">编辑资料</h3>
          <form @submit.prevent="handleSaveNickname" class="flex gap-3 items-end">
            <div class="flex-1">
              <label class="label pb-1" for="settings-nickname">
                <span class="label-text font-medium">昵称</span>
              </label>
              <input
                id="settings-nickname"
                type="text"
                class="input input-bordered w-full"
                v-model="editNickname"
                placeholder="设置昵称"
              />
            </div>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="loading loading-spinner loading-xs"></span>
              <template v-else>保存</template>
            </button>
          </form>
          <div v-if="editError" class="alert alert-error text-sm">{{ editError }}</div>
        </div>

        <!-- Account info -->
        <div class="rounded-2xl bg-card-bg shadow-xl border border-surface-3 p-6 space-y-4">
          <h3 class="text-lg font-semibold">账户信息</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-text-muted block mb-0.5">用户 ID</span>
              <span class="font-medium font-mono">{{ state.user?.id }}</span>
            </div>
            <div>
              <span class="text-text-muted block mb-0.5">用户名</span>
              <span class="font-medium">{{ state.user?.username }}</span>
            </div>
            <div>
              <span class="text-text-muted block mb-0.5">等级</span>
              <span class="badge badge-sm" :class="levelBadgeClass">{{ levelLabel }}</span>
            </div>
            <div>
              <span class="text-text-muted block mb-0.5">角色</span>
              <span class="font-medium">{{ state.user?.role || 'member' }}</span>
            </div>
            <div>
              <span class="text-text-muted block mb-0.5">邮箱</span>
              <span class="font-medium">{{ state.user?.email || '未绑定' }}</span>
            </div>
            <div>
              <span class="text-text-muted block mb-0.5">手机号</span>
              <span class="font-medium">{{ state.user?.phone || '未绑定' }}</span>
            </div>
          </div>

          <div v-if="state.user?.account_level === 'local'" class="alert alert-info text-sm">
            <span>当前为本地账户，绑定邮箱或手机号可自动升级为普通账户，解锁全部功能。</span>
          </div>
        </div>

        <div class="flex gap-3 justify-between">
          <a :href="getAuthPath('account/recovery')" class="btn btn-ghost btn-sm">密码找回</a>
          <button type="button" class="btn btn-ghost btn-sm text-error" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </div>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthProvider } from '~/features/auth/composables/useAuth';
import { getAuthPath } from '~/features/auth/constants/auth-paths';
import ProtectedRoute from '~/features/auth/components/settings/ProtectedRoute.vue';
import type { User } from '~/types/auth';

const { state, updateUser, logout } = useAuthProvider();

const message = ref('');
const saving = ref(false);
const editNickname = ref(state.user?.nickname || '');
const editError = ref('');

const avatarLetter = computed(() =>
  (state.user?.nickname || state.user?.username || '?').charAt(0).toUpperCase()
);

const levelBadgeClass = computed(() => {
  const level = state.user?.account_level;
  return level === 'admin' ? 'badge-error' : level === 'normal' ? 'badge-primary' : 'badge-ghost';
});
const levelLabel = computed(() => {
  const level = state.user?.account_level;
  return level === 'admin' ? '管理员' : level === 'normal' ? '普通账户' : '本地账户';
});

function handleUpdate(user: User) {
  updateUser(user);
  message.value = '设置已更新';
  setTimeout(() => (message.value = ''), 3000);
}

async function handleSaveNickname() {
  editError.value = '';
  saving.value = true;
  try {
    if (state.user) {
      updateUser({ ...state.user, nickname: editNickname.value || null });
      message.value = '资料已更新';
      setTimeout(() => (message.value = ''), 3000);
    }
  } catch {
    editError.value = '保存失败，请重试';
  } finally {
    saving.value = false;
  }
}

async function handleLogout() {
  await logout();
}
</script>
