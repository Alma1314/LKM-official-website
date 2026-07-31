import type { AuthContextType, DemoUser } from '~/types/auth';

/**
 * StarHope AuthStore — 对接网站主账户系统。
 * 不再维护独立的 LocalUser/IndexedDB 认证，
 * 改为从主站 AuthContext 读取网站登录状态。
 *
 * 注意：AuthContext 依赖 Vue 的 inject/provide，仅在 Astro + Vue Island 中可用。
 * StarHope 是 Svelte 组件，通过全局桥接访问 Vue 的 authContext。
 */

// 全局桥接：由 AuthProvider（Vue）在挂载时注入
let _authContext: AuthContextType | null = null;

export function setStarHopeAuthContext(ctx: AuthContextType | null) {
  _authContext = ctx;
}

class AuthStore {
  get isLoggedIn(): boolean {
    return _authContext?.state.isLoggedIn ?? false;
  }

  get currentUser(): DemoUser | null {
    return _authContext?.state.user ?? null;
  }

  get userId(): string | null {
    return this.currentUser?.id ?? null;
  }

  logout() {
    _authContext?.logout();
  }
}

export const authStore = new AuthStore();
