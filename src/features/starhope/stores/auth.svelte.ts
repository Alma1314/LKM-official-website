import { db } from '~/features/starhope/stores/db.svelte';
import type { LocalUser } from '~/features/starhope/types';

class AuthStore {
  currentUser = $state<LocalUser | null>(null);
  isLoggedIn = $derived(this.currentUser !== null);

  async login(account: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const user = await db.users.where('account').equals(account).first();
    if (!user) return { ok: false, error: '账号不存在' };

    const hash = await this.hashPassword(password, user.salt);
    if (hash !== user.passwordHash) return { ok: false, error: '密码错误' };

    this.currentUser = user;
    return { ok: true };
  }

  async register(nickname: string, account: string, password: string): Promise<{ ok: boolean; error?: string }> {
    const existing = await db.users.where('account').equals(account).first();
    if (existing) return { ok: false, error: '账号已存在' };

    const salt = crypto.randomUUID();
    const passwordHash = await this.hashPassword(password, salt);

    const user: LocalUser = {
      id: crypto.randomUUID(),
      nickname,
      account,
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    };

    await db.users.put(user);
    this.currentUser = user;
    return { ok: true };
  }

  logout() {
    this.currentUser = null;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: encoder.encode(salt), iterations: 120000, hash: 'SHA-256' },
      key,
      256
    );
    return Array.from(new Uint8Array(bits))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const authStore = new AuthStore();
