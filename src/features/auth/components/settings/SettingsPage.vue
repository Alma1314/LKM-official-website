<template>
  <ProtectedRoute>
    <div class="relative min-h-[calc(100vh-12rem)] px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-semibold mb-2">账户设置</h1>
          <p class="text-sm text-text-muted">管理你的个人资料和安全设置</p>
        </div>

        <div v-if="message" class="alert alert-success text-sm mb-6">{{ message }}</div>

        <!-- 移动端顶部分段（横向滚动） -->
        <div class="md:hidden overflow-x-auto mb-6 -mx-4 px-4">
          <div class="flex gap-2 w-max">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              class="btn btn-sm"
              :class="activeSection === tab.key ? 'btn-primary' : 'btn-ghost'"
              @click="activeSection = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col md:flex-row gap-6">
          <!-- 桌面左侧导航 -->
          <aside class="hidden md:block w-56 shrink-0">
            <nav class="sticky top-6 space-y-1" aria-label="账户设置导航">
              <button
                v-for="grp in groups"
                :key="grp.key"
                type="button"
                class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium"
                :class="activeSection === grp.key ? 'bg-primary/10 text-primary' : 'text-text-muted hover:bg-page-bg'"
                @click="activeSection = grp.key"
              >
                {{ grp.label }}
              </button>
            </nav>
          </aside>

          <!-- 右侧内容卡 -->
          <main class="flex-1 min-w-0 space-y-6">
            <!-- 个人信息 -->
            <section
              v-show="activeSection === 'profile'"
              class="rounded-2xl bg-card-bg shadow-xl border border-surface-3 p-6 space-y-4"
            >
              <h3 class="text-lg font-semibold">个人资料</h3>

              <div class="flex items-center gap-5">
                <div
                  class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0"
                >
                  {{ avatarLetter }}
                </div>
                <div class="flex-1">
                  <div class="text-lg font-semibold">{{ store.user?.nickname || store.user?.username }}</div>
                  <div class="text-sm text-text-muted">@{{ store.user?.username }}</div>
                  <span class="badge badge-sm mt-1" :class="levelBadgeClass">{{ levelLabel }}</span>
                </div>
              </div>

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

              <!-- 用户只读信息 -->
              <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm border-t border-surface-3 pt-4">
                <div>
                  <dt class="text-text-muted mb-0.5">用户 ID</dt>
                  <dd class="font-mono">{{ store.user?.id }}</dd>
                </div>
                <div>
                  <dt class="text-text-muted mb-0.5">用户名</dt>
                  <dd class="font-medium">{{ store.user?.username }}</dd>
                </div>
                <div>
                  <dt class="text-text-muted mb-0.5">等级</dt>
                  <dd>
                    <span class="badge badge-sm" :class="levelBadgeClass">{{ levelLabel }}</span>
                  </dd>
                </div>
                <div>
                  <dt class="text-text-muted mb-0.5">角色</dt>
                  <dd class="font-medium">{{ store.user?.role || 'member' }}</dd>
                </div>
                <div>
                  <dt class="text-text-muted mb-0.5">邮箱</dt>
                  <dd class="font-medium">{{ store.user?.email || '未绑定' }}</dd>
                </div>
                <div>
                  <dt class="text-text-muted mb-0.5">手机号</dt>
                  <dd class="font-medium">{{ store.user?.phone || '未绑定' }}</dd>
                </div>
              </dl>
            </section>

            <!-- 登录与安全 -->
            <section
              v-show="activeSection === 'security'"
              class="rounded-2xl bg-card-bg shadow-xl border border-surface-3 p-6"
            >
              <h3 class="text-lg font-semibold mb-4">登录与安全</h3>
              <div class="space-y-6 divide-y divide-surface-3">
                <BindMethods :user="store.user!" @update="handleUserUpdate" />
                <div class="pt-6"><TwoFactorSetup :user="store.user!" @update="handleUserUpdate" /></div>
                <div class="pt-6"><PasskeySetup :user="store.user!" @update="handleUserUpdate" /></div>
              </div>
            </section>

            <!-- 账户操作 -->
            <section
              v-show="activeSection === 'account'"
              class="rounded-2xl bg-card-bg shadow-xl border border-surface-3 p-6 space-y-4"
            >
              <h3 class="text-lg font-semibold">账户操作</h3>

              <div v-if="store.user?.account_level === 'local'" class="alert alert-info text-sm">
                <span> 当前为本地账户，绑定邮箱或手机号可自动升级为普通账户，解锁全部功能。 </span>
              </div>

              <div class="flex flex-wrap gap-3 justify-between">
                <a :href="getAuthPath('account/recovery')" class="btn btn-ghost btn-sm">密码找回</a>
                <ConfirmDialog
                  :open="confirmLogout"
                  title="退出登录"
                  message="确定要退出当前账户吗？"
                  confirm-text="退出登录"
                  @confirm="handleLogout"
                  @cancel="confirmLogout = false"
                />
                <button type="button" class="btn btn-ghost btn-sm text-error" @click="confirmLogout = true">
                  退出登录
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  </ProtectedRoute>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { getAuthPath } from '~/features/auth/constants/auth-paths';
import ProtectedRoute from '~/features/auth/components/settings/ProtectedRoute.vue';
import BindMethods from '~/features/auth/components/settings/BindMethods.vue';
import TwoFactorSetup from '~/features/auth/components/settings/TwoFactorSetup.vue';
import PasskeySetup from '~/features/auth/components/settings/PasskeySetup.vue';
import ConfirmDialog from '~/features/auth/components/settings/ConfirmDialog.vue';
import type { User } from '~/types/auth';
import { authApi } from '~/lib/api/modules/auth';

const store = useAuthStore();

type SectionKey = 'profile' | 'security' | 'account';

const groups = [
  { key: 'profile', label: '个人资料' },
  { key: 'security', label: '登录与安全' },
  { key: 'account', label: '账户操作' },
] as const;

const tabs = groups;

const activeSection = ref<SectionKey>('profile');

const message = ref('');
const saving = ref(false);
const editNickname = ref(store.user?.nickname || '');
const editError = ref('');
const confirmLogout = ref(false);

const avatarLetter = computed(() => (store.user?.nickname || store.user?.username || '?').charAt(0).toUpperCase());

const levelBadgeClass = computed(() => {
  const level = store.user?.account_level;
  return level === 'admin' ? 'badge-error' : level === 'normal' ? 'badge-primary' : 'badge-ghost';
});
const levelLabel = computed(() => {
  const level = store.user?.account_level;
  return level === 'admin' ? '管理员' : level === 'normal' ? '普通账户' : '本地账户';
});

function handleUserUpdate(_user: User) {
  message.value = '安全设置已更新';
  setTimeout(() => (message.value = ''), 3000);
}

async function handleSaveNickname() {
  editError.value = '';
  saving.value = true;
  try {
    if (store.user) {
      const r = await authApi.editProfile(store.user.id, { nickname: editNickname.value || null });
      if (r.isErr()) {
        editError.value = r.error.message || '保存失败，请重试';
        return;
      }
      store.updateUser({ ...store.user, nickname: r.value?.nickname ?? null });
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
  confirmLogout.value = false;
  await store.logout();
}
</script>
