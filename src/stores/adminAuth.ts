// src/stores/adminAuth.ts
// 后台管理员登录态（Pinia，单一状态源）。
//
// 与前台 auth 不同：后台凭证在 httpOnly cookie，前端不读写 token。
// 本 store 只记录"当前后台用户信息 + 会话状态"，供 /admin 页面决定展示登录界面还是业务内容。
import { defineStore } from "pinia";
import { ref } from "vue";
import {
  adminLogin as apiAdminLogin,
  adminLogout as apiAdminLogout,
  bootAdminSession as apiBootAdminSession,
  resetRedirectGuard,
  readAdminResp,
  adminFetch,
  type AdminUser,
} from "~/lib/api/admin";

export type AdminSession = "idle" | "checking" | "authenticated" | "anonymous";

export const useAdminAuthStore = defineStore("adminAuth", () => {
  const user = ref<AdminUser | null>(null);
  const session = ref<AdminSession>("idle");
  const isLoggedIn = ref(false);

  /** 进入后台前调用：校验 cookie 会话。 */
  async function check(): Promise<boolean> {
    session.value = "checking";
    const u = await apiBootAdminSession();
    if (u) {
      user.value = u;
      isLoggedIn.value = true;
      session.value = "authenticated";
      return true;
    }
    user.value = null;
    isLoggedIn.value = false;
    session.value = "anonymous";
    return false;
  }

  /** 后台登录；成功后后端 Set-Cookie 已写入，设置登录态。 */
  async function login(username: string, password: string): Promise<void> {
    const { user: u } = await apiAdminLogin(username, password);
    user.value = u;
    isLoggedIn.value = true;
    session.value = "authenticated";
  }

  /** 后台登出：清 cookie 会话与本地姿态，重入锁复位（供页面跳转到 /admin/login）。 */
  async function logout(): Promise<void> {
    await apiAdminLogout();
    user.value = null;
    isLoggedIn.value = false;
    session.value = "anonymous";
    resetRedirectGuard();
  }

  /** 供守卫在并发静默失败时复位（可选）。 */
  function resetGuard(): void {
    resetRedirectGuard();
  }

  return {
    user,
    session,
    isLoggedIn,
    check,
    login,
    logout,
    resetGuard,
    readAdminResp,
    adminFetch,
  };
});
