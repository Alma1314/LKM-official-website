// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import OAuthCallback from '../components/login/OAuthCallback.vue';
import { useAuthStore } from '~/stores/auth';

function setHash(hash: string): void {
  // happy-dom 中直接改写 location.hash 会同步更新 href；无 hash 时置空
  window.location.hash = hash;
}

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
  localStorage.clear();
  // 屏蔽导航与事件副作用
  vi.spyOn(window.location, 'replace').mockImplementation(() => {});
  vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
  vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
});

describe('OAuthCallback fragment 解析', () => {
  it('从 #fragment 读取 access_token 与 refresh_token 并写入 store', async () => {
    setHash('#access_token=acc123&refresh_token=ref123');
    const store = useAuthStore();
    const setSpy = vi.spyOn(store, 'setTokens');

    mount(OAuthCallback);
    await flushPromises();

    expect(setSpy).toHaveBeenCalledWith('acc123', 'ref123');
  });

  it('requires_2fa 时持久化 temp_token 供后续验证', async () => {
    setHash('#temp_token=tmp999&requires_2fa=true');
    const store = useAuthStore();
    const holdSpy = vi.spyOn(store, 'holdPending2FA');

    mount(OAuthCallback);
    await flushPromises();

    expect(holdSpy).toHaveBeenCalledWith('tmp999');
  });

  it('解析后清理 URL（含 fragment），令牌不留地址栏', async () => {
    setHash('#access_token=acc123');
    const store = useAuthStore();
    window.location.pathname = '/login/success';

    mount(OAuthCallback);
    await flushPromises();

    expect(window.history.replaceState).toHaveBeenCalledWith({}, '', window.location.pathname);
    void store;
  });
});
