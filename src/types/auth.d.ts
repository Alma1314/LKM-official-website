export type AccountLevel = 'local' | 'normal' | 'admin';

export type LoginMethod = 'password' | 'sms' | 'github' | 'magic-link' | 'passkey';

export type AuthFlow = 'idle' | 'logging_in' | '2fa_required' | '2fa_setup_required' | 'logged_in';

export interface DemoUser {
  id: string;
  username: string;
  password: string;
  level: AccountLevel;
  email: string | null;
  phone: string | null;
  has2FA: boolean;
  hasPasskey: boolean;
  hasGithub: boolean;
  bindings: string[];
}

export interface TempSession {
  userId: string;
  method: LoginMethod;
  /** 密码找回时使用 */
  isRecovery?: boolean;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: DemoUser | null;
  flow: AuthFlow;
  tempSession: TempSession | null;
  loginMethod: LoginMethod | null;
  /** 密码错误次数 */
  passwordAttempts: number;
  /** 账号锁定截止时间戳 */
  lockedUntil: number | null;
  /** 2FA 信任设备到期时间戳 */
  trustedUntil: number | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (method: LoginMethod, credentials: Record<string, string>, account?: DemoUser) => LoginResult;
  register: (type: 'local' | 'normal', data: RegisterData) => RegisterResult;
  logout: () => void;
  updateUser: (user: DemoUser) => void;
}

import type { AppError } from '~/core/errors/error-codes';

export interface AuthSuccess {
  requires2FA?: boolean;
  requires2FASetup?: boolean;
}

export type LoginResult = import('~/core/errors/result').Result<AuthSuccess, AppError>;

export type RegisterResult = import('~/core/errors/result').Result<void, AppError>;

export interface RegisterData {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
}
