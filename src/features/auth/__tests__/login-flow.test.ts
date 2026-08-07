// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useLoginFlow } from '../composables/useLoginFlow';
import { useVerificationCountdown } from '../composables/useVerificationCountdown';
import * as authModule from '~/lib/api/modules/auth';
import { ok, err } from '~/lib/errors/result';
import { AppError, ErrorCode } from '~/lib/errors/error-codes';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('useVerificationCountdown', () => {
  it('倒计时结束后归零并停止', async () => {
    vi.useFakeTimers();
    const c = useVerificationCountdown(2);
    c.start();
    expect(c.running).toBe(true);
    vi.advanceTimersByTime(2000);
    expect(c.countdown).toBe(0);
    expect(c.running).toBe(false);
    vi.useRealTimers();
  });
});

describe('useLoginFlow', () => {
  it('密码登录成功触发 onSuccess', async () => {
    vi.spyOn(authModule.authApi, 'loginPassword').mockResolvedValue(
      ok({ access_token: 'a', refresh_token: 'r', user_id: 1, account_level: 'local' })
    );
    vi.spyOn(authModule.authApi, 'getMe').mockResolvedValue(ok({ id: 1, username: 'alma', account_level: 'local' }));
    const onSuccess = vi.fn();
    const flow = useLoginFlow({ redirect: null, onSuccess });
    flow.account.value = 'alma';
    flow.password.value = '123456';
    await flow.submitPassword();
    expect(onSuccess).toHaveBeenCalled();
  });

  it('透出的 countdown / countdownRunning 响应式实时递减', async () => {
    vi.useFakeTimers();
    const flow = useLoginFlow({ redirect: null });
    // 触发 requestCode 以启动倒计时（注入 mock 避免真实网络）
    vi.spyOn(authModule.authApi, 'requestLoginCode').mockResolvedValue(ok({ message: 'ok' }));
    flow.account.value = 'alma';
    await flow.requestCode();
    expect(flow.countdownRunning.value).toBe(true);
    expect(flow.countdown.value).toBe(60);
    vi.advanceTimersByTime(3000);
    expect(flow.countdown.value).toBe(57);
    expect(flow.countdownRunning.value).toBe(true);
    vi.useRealTimers();
  });

  it('密码错误显示中文 error 且不触发 onSuccess', async () => {
    vi.spyOn(authModule.authApi, 'loginPassword').mockResolvedValue(
      err(new AppError(ErrorCode.AUTH_ERROR as never, '密码错误'))
    );
    const onSuccess = vi.fn();
    const flow = useLoginFlow({ redirect: null, onSuccess });
    flow.account.value = 'x';
    flow.password.value = 'y';
    await flow.submitPassword();
    expect(flow.error.value).toBeTruthy();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
