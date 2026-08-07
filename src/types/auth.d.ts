import type { AppError } from '~/lib/errors';
import type { Result } from '~/lib/errors/result';

// ── 真实用户类型（对齐后端 UserInfo + profile） ──

export interface User {
  id: number;
  username: string;
  account_level: 'local' | 'normal' | 'admin';
  email?: string | null;
  phone?: string | null;
  nickname?: string | null;
  avatar?: string | null;
  role?: string;
}

export type AccountLevel = User['account_level'];
export type LoginMethod = 'password' | 'sms' | 'github' | 'magic-link' | 'passkey';
export type AuthFlow = 'idle' | 'logging_in' | '2fa_required' | '2fa_setup_required' | 'logged_in';

export interface TempSession {
  userId: number;
  method: LoginMethod;
  isRecovery?: boolean;
}

export interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  flow: AuthFlow;
  tempSession: TempSession | null;
  loginMethod: LoginMethod | null;
}

export interface AuthSuccess {
  requires2FA?: boolean;
  requires2FASetup?: boolean;
}

export interface AuthContextType {
  state: import('vue').Reactive<AuthState>;
  login: (method: LoginMethod, credentials: Record<string, string>, account?: User) => LoginResult;
  register: (type: 'local' | 'normal', data: RegisterData) => RegisterResult;
  registerNormal?: (username: string, password: string, email?: string, phone?: string) => Promise<RegisterResult>;
  verifyNormalRegister?: (txnId: string, code: string, type: 'email' | 'phone') => Promise<LoginResult>;
  requestLoginCode?: (contact: string) => Promise<Result<import('~/lib/api/modules/auth').MessageResponse, AppError>>;
  loginCode?: (contact: string, code: string) => LoginResult;
  requestMagicLink?: (email: string) => Promise<Result<import('~/lib/api/modules/auth').MessageResponse, AppError>>;
  verifyMagicLink?: (token: string) => LoginResult;
  logout: () => void;
  updateUser: (user: User) => void;
}

export interface RegisterData {
  username: string;
  password?: string;
  email?: string;
  phone?: string;
}

export type LoginResult = Result<AuthSuccess, AppError>;
export type RegisterResult = Result<void, AppError>;
