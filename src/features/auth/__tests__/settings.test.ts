// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import BindMethods from '../components/settings/BindMethods.vue';
import TwoFactorSetup from '../components/settings/TwoFactorSetup.vue';
import PasskeySetup from '../components/settings/PasskeySetup.vue';
import ConfirmDialog from '../components/settings/ConfirmDialog.vue';
import ProtectedRoute from '../components/settings/ProtectedRoute.vue';
import { authApi } from '~/lib/api/modules/auth';
import { ok } from '~/lib/errors/result';
import { useAuthStore } from '~/stores/auth';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
  localStorage.clear();
  document.body.innerHTML = '';
});

function makeUser(over: Record<string, unknown> = {}) {
  return { id: 1, username: 'alma', account_level: 'normal', email: null, phone: null, ...over };
}

describe('BindMethods', () => {
  it('渲染邮箱绑定状态', async () => {
    vi.spyOn(authApi, 'getBindings').mockResolvedValue(ok({ email: 'a@b.com', phone: null, github: false }) as never);
    const w = mount(BindMethods, {
      props: { user: makeUser() as never },
    });
    await flushPromises();
    expect(w.text()).toContain('a@b.com');
  });
});

describe('TwoFactorSetup', () => {
  it('渲染已开启的 2FA 开关', async () => {
    vi.spyOn(authApi, 'getRecoveryCodes').mockResolvedValue(
      ok({ two_factor_enabled: true, recovery_codes: null }) as never
    );
    const w = mount(TwoFactorSetup, {
      props: { user: makeUser() as never },
    });
    await flushPromises();
    expect(w.text()).toContain('双因素');
    expect(w.text()).toContain('已开启');
  });
});

describe('PasskeySetup', () => {
  it('渲染 passkey 列表', async () => {
    vi.spyOn(authApi, 'listPasskeys').mockResolvedValue(
      ok([{ id: 1, credential_id: 'c', name: '我的钥匙', created_at: '2026-01-01' }]) as never
    );
    const w = mount(PasskeySetup, {
      props: { user: makeUser() as never },
    });
    await flushPromises();
    expect(w.text()).toContain('我的钥匙');
  });
});

describe('ConfirmDialog', () => {
  it('打开时确认触发 confirm 事件', async () => {
    const w = mount(ConfirmDialog, {
      props: { open: true, message: '确定删除？', confirmText: '删除' },
    });
    await flushPromises();
    const confirmBtn = document.querySelector('button[data-testid="confirm"]') as HTMLButtonElement;
    expect(confirmBtn).toBeTruthy();
    confirmBtn.click();
    expect(w.emitted('confirm')).toBeTruthy();
  });
});

describe('ProtectedRoute', () => {
  it('anonymous 时提示登录', async () => {
    const s = useAuthStore();
    s.session = 'anonymous';
    s.isLoggedIn = false;
    const w = mount(ProtectedRoute, { slots: { default: '<div>内容</div>' } });
    await flushPromises();
    expect(w.text()).toContain('请先登录');
    expect(w.text()).not.toContain('内容');
  });
});
