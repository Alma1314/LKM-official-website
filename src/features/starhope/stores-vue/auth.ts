import { computed, type ComputedRef } from 'vue';
import type { AuthContextType, User } from '~/types/auth';

// 全局桥接：由 AuthProvider（Vue）在挂载时注入
let _authContext: AuthContextType | null = null;

export function setStarHopeAuthContext(ctx: AuthContextType | null): void {
  _authContext = ctx;
}

export function useAuthStore(): {
  isLoggedIn: ComputedRef<boolean>;
  currentUser: ComputedRef<User | null>;
  userId: ComputedRef<number | null>;
  logout: () => void;
} {
  const isLoggedIn = computed(() => _authContext?.state.isLoggedIn ?? false);
  const currentUser = computed<User | null>(() => _authContext?.state.user ?? null);
  const userId = computed(() => currentUser.value?.id ?? null);

  function logout(): void {
    _authContext?.logout();
  }

  return { isLoggedIn, currentUser, userId, logout };
}
