// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useOnboardingFlow } from '../composables/useOnboardingFlow';
import { ok } from '~/lib/errors/result';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('useOnboardingFlow', () => {
  it('saveStep 更新后端并推进', async () => {
    const authApi = await import('~/lib/api/modules/auth');
    vi.spyOn(authApi.authApi, 'setOnboardingStep').mockResolvedValue(
      ok({ step: 1, completed: false, data: { grade: 'math' } })
    );
    const flow = useOnboardingFlow();
    await flow.saveStep(1, { grade: 'math' });
    expect(flow.step).toBe(1);
    expect(flow.dataByStep[1]).toEqual({ grade: 'math' });
  });

  it('load 恢复未完成步骤', async () => {
    const authApi = await import('~/lib/api/modules/auth');
    vi.spyOn(authApi.authApi, 'getOnboarding').mockResolvedValue(
      ok({ step: 3, completed: false, data: { 1: { grade: 'math' } } })
    );
    const flow = useOnboardingFlow();
    await flow.load();
    expect(flow.step).toBe(3);
  });

  it('skipAll 调用 skip 并跳转到 onDone', async () => {
    const authApi = await import('~/lib/api/modules/auth');
    vi.spyOn(authApi.authApi, 'skipOnboarding').mockResolvedValue(ok({ step: 4, completed: true, data: null }));
    const onDone = vi.fn();
    const flow = useOnboardingFlow({ redirect: '/official', onDone });
    await flow.skipAll();
    expect(flow.completed).toBe(true);
    expect(onDone).toHaveBeenCalledWith('/official');
  });

  it('markDone 置 completed 并触发 onDone 跳转', async () => {
    const onDone = vi.fn();
    const flow = useOnboardingFlow({ redirect: '/official', onDone });
    flow.markDone();
    expect(flow.completed).toBe(true);
    expect(onDone).toHaveBeenCalledWith('/official');
  });
});
