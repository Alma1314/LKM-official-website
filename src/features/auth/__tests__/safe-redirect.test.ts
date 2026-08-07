import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveSafeRedirect } from '../utils/safe-redirect';

beforeEach(() => {
  delete (globalThis as { window?: unknown }).window;
});
afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('resolveSafeRedirect', () => {
  it('接受 base 下站内相对路径', () => {
    expect(resolveSafeRedirect('/LKM-official-website/account')).toBe('/LKM-official-website/account');
  });
  it('拒绝外部协议', () => {
    expect(resolveSafeRedirect('https://evil.com')).toBe('/');
  });
  it('拒绝协议相对与反斜杠', () => {
    expect(resolveSafeRedirect('//evil.com')).toBe('/');
    expect(resolveSafeRedirect('\\evil')).toBe('/');
  });
  it('null/空串回退首页', () => {
    expect(resolveSafeRedirect(null)).toBe('/');
    expect(resolveSafeRedirect('')).toBe('/');
  });
  it('未定义 base 时回退根路径', () => {
    expect(resolveSafeRedirect('/foo')).toBe('/foo');
  });
});
