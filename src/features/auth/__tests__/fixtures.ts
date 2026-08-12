import { setActivePinia } from 'pinia';
import { createTestingPinia, type TestingPinia } from '@pinia/testing';
import { AppError, ErrorCode, type ErrorCodeType } from '~/lib/errors/error-codes';
import type { User } from '~/types/auth';

export function makeUser(over: Partial<User> = {}): User {
  return { id: 1, username: 'alma', account_level: 'normal', email: null, phone: null, ...over };
}

export function makeStore(over: Record<string, unknown> = {}): TestingPinia {
  const pinia = createTestingPinia({ stubActions: false });
  setActivePinia(pinia);
  // over 参数占位，便于后续扩展 store 配置
  void over;
  return pinia;
}

export function makeAppError(code: ErrorCodeType = ErrorCode.AUTH_ERROR, message = 'err'): AppError {
  return new AppError(code, message);
}
