import { computed } from 'vue';
import type { AuthContextType, DemoUser } from '~/types/auth';

// 全局桥接：由 AuthProvider（Vue）在挂载时注入
let _authContext: AuthContextType | null = null;

export function setStarHopeAuthContext(ctx: AuthContextType | null) {
  _authContext = ctx;
}

export function useAuthStore() {
  const isLoggedIn = computed(() => _authContext?.state.isLoggedIn ?? false);
  const currentUser = computed<DemoUser | null>(() => _authContext?.state.user ?? null);
  const userId = computed(() => currentUser.value?.id ?? null);

  function logout() {
    _authContext?.logout();
  }

  return { isLoggedIn, currentUser, userId, logout };
}
