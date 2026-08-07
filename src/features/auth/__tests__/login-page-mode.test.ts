// @vitest-environment happy-dom
// 验证 flow.mode 在模板中解包正确：切换分段控件后，登录/验证码表单随之切换。
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginPage from '../components/login/LoginPage.vue';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
  localStorage.clear();
});

describe('LoginPage flow.mode 解包', () => {
  it('默认密码表单；点击「验证码登录」切到验证码表单', async () => {
    const w = mount(LoginPage, { props: { mode: 'modal' } });
    // 默认：密码表单可见（提供包含「密码」标签的 AuthField；输入框 placeholder 含"密码"）
    const pwInput = w.find('input[autocomplete="current-password"]');
    expect(pwInput.exists()).toBe(true);

    // 切换到「验证码登录」
    const buttons = w.findAll('button');
    const codeTab = buttons.find((b) => b.text().includes('验证码登录'));
    expect(codeTab, '应存在“验证码登录”分段').toBeTruthy();
    await codeTab!.trigger('click');

    // 验证码态：出现「获取验证码」按钮，且不再渲染密码输入框
    const getBtn = w.findAll('button').find((b) => b.text().includes('获取验证码'));
    expect(getBtn, '切换后应出现“获取验证码”按钮').toBeTruthy();
    expect(w.find('input[autocomplete="current-password"]').exists()).toBe(false);
  });

  it('flow.mode 是 Ref，读取需经 .value（JS 上下文），模板自动解包', async () => {
    const w = mount(LoginPage, { props: { mode: 'modal' } });
    // 通过 vm 拿到组件内部 flow？LoginPage 未 expose flow；这里退而用组件响应断言：
    // 模板用 `flow.mode === 'x'` 的 v-if 驱动，能渲染即说明解包生效。
    expect(w.find('input[autocomplete="current-password"]').exists()).toBe(true);
    expect(w.find('button').text()).toContain('登录');
  });
});
