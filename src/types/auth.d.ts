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
  bio?: string | null;
  major?: string | null;
  grade?: string | null;
  interests?: string[];
  ideals?: string | null;
  points?: number;
  follower_count?: number;
  following_count?: number;
  post_count?: number;
  project_count?: number;
  column_article_count?: number;
  has_column_access?: boolean;
  title?: string;
}

export type AccountLevel = User['account_level'];
export type LoginMethod = 'password' | 'sms' | 'github' | 'magic-link' | 'passkey';
export type AuthFlow = 'idle' | 'logging_in' | '2fa_required' | '2fa_setup_required' | 'logged_in';
export type SessionStatus = 'anonymous' | 'restoring' | 'authenticated';

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
  session: SessionStatus;
  lockedUntil?: number | null;
}

export interface AuthSuccess {
  requires2FA?: boolean;
  requires2FASetup?: boolean;
}

export interface AuthContextType {
  state: import('vue').Reactive<AuthState>;
  login: (method: LoginMethod, credentials: Record<string, string>, account?: User) => Promise<LoginResult>;
  register: (type: 'local' | 'normal', data: RegisterData) => Promise<RegisterResult>;
  registerNormal?: (username: string, password: string, email?: string, phone?: string) => Promise<RegisterResult>;
  verifyNormalRegister?: (txnId: string, code: string, type: 'email' | 'phone') => Promise<LoginResult>;
  requestLoginCode?: (contact: string) => Promise<Result<import('~/lib/api/modules/auth').MessageResponse, AppError>>;
  loginCode?: (contact: string, code: string) => Promise<LoginResult>;
  requestMagicLink?: (email: string) => Promise<Result<import('~/lib/api/modules/auth').MessageResponse, AppError>>;
  verifyMagicLink?: (token: string) => Promise<LoginResult>;
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
