import { computed, type ComputedRef } from 'vue';
import { useAuthStore as usePiniaAuth } from '~/stores/auth';
import type { UserInfo } from '~/lib/api/modules/auth';

export function useAuthStore(): {
  isLoggedIn: ComputedRef<boolean>;
  currentUser: ComputedRef<UserInfo | null>;
  userId: ComputedRef<number | null>;
  logout: () => Promise<void>;
} {
  const store = usePiniaAuth();

  const isLoggedIn = computed(() => store.isLoggedIn);
  const currentUser = computed<UserInfo | null>(() => store.user ?? null);
  const userId = computed(() => store.user?.id ?? null);

  async function logout(): Promise<void> {
    await store.logout();
  }

  return { isLoggedIn, currentUser, userId, logout };
}
