// src/features/auth/lib/webauthn.ts
// WebAuthn 工具：把后端 begin 接口返回的 public_key（JSON dict）转换为可传给
// navigator.credentials 的 options，并把浏览器返回的凭据序列化为后端
// complete 接口所需的 payload。仅在浏览器环境中可用，SSR/Node 下应提前短路。

export interface SerializedAttestation {
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
  };
}

export interface SerializedAssertion {
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    /** 可选：passkey 认证返回的 userHandle（Base64URL）。 */
    userHandle?: string;
  };
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && !!navigator.credentials;
}

/** 非浏览器环境下抛出可读错误（避免 RawError 泄漏）。 */
function requireBrowser(): void {
  if (!isBrowser()) {
    throw new Error('WebAuthn 仅在浏览器环境可用，请使用支持的浏览器并确保 HTTPS 或 localhost');
  }
}

// ── Base64URL <-> ArrayBuffer ──

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  // URL-safe base64 -> base64
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// ── public_key（后端 dict）→ 标准 options ──

interface JsonWebElement {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  [key: string]: any;
}

/** 递归地把符合 Base64URL 的 id/challenge 字符串及 Uint8Array/Array 还原为 ArrayBuffer。 */
function decodePublicKey<T extends JsonWebElement>(pk: T): T {
  const out = { ...pk } as T;
  for (const key of Object.keys(out)) {
    const value = out[key];
    if (key === 'id' || key === 'challenge' || key === 'userHandle') {
      if (typeof value === 'string') {
        (out as JsonWebElement)[key] = base64UrlToBuffer(value);
      } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        // 已经是正确的 Buffer 形态
      } else if (Array.isArray(value)) {
        (out as JsonWebElement)[key] = new Uint8Array(value as number[]).buffer;
      }
    } else if (value && typeof value === 'object') {
      (out as JsonWebElement)[key] = decodePublicKey(value);
    }
  }
  return out;
}

export function toPublicKeyCredentialCreationOptions(pk: Record<string, unknown>): PublicKeyCredentialCreationOptions {
  const opts = decodePublicKey(pk as JsonWebElement) as PublicKeyCredentialCreationOptions;
  // publicKey 本身需要顶层字段名与浏览器 API 对齐
  return {
    ...opts,
    challenge: opts.challenge,
    rp: opts.rp,
    user: opts.user,
    pubKeyCredParams: opts.pubKeyCredParams,
    excludeCredentials: opts.excludeCredentials,
    timeout: opts.timeout,
    authenticatorSelection: opts.authenticatorSelection,
    attestation: opts.attestation,
  };
}

export function toPublicKeyCredentialRequestOptions(pk: Record<string, unknown>): PublicKeyCredentialRequestOptions {
  return decodePublicKey(pk as JsonWebElement) as PublicKeyCredentialRequestOptions;
}

// ── 浏览器凭据 → 后端序列化 payload ──

export function serializeAttestation(
  cred: PublicKeyCredential & { response: AuthenticatorAttestationResponse }
): SerializedAttestation {
  return {
    rawId: bufferToBase64Url(cred.rawId),
    response: {
      clientDataJSON: bufferToBase64Url(cred.response.clientDataJSON),
      attestationObject: bufferToBase64Url(cred.response.attestationObject),
    },
  };
}

export function serializeAssertion(
  cred: PublicKeyCredential & { response: AuthenticatorAssertionResponse }
): SerializedAssertion {
  const serialized: SerializedAssertion = {
    rawId: bufferToBase64Url(cred.rawId),
    response: {
      clientDataJSON: bufferToBase64Url(cred.response.clientDataJSON),
      authenticatorData: bufferToBase64Url(cred.response.authenticatorData),
      signature: bufferToBase64Url(cred.response.signature),
    },
  };
  if (cred.response.userHandle && cred.response.userHandle.byteLength > 0) {
    serialized.response.userHandle = bufferToBase64Url(cred.response.userHandle as ArrayBuffer);
  }
  return serialized;
}

// ── 高层封装 ──

/** 注册新 passkey：begin → navigator.credentials.create → 序列化。 */
export async function registerNew(pk: Record<string, unknown>): Promise<SerializedAttestation> {
  requireBrowser();
  const options = toPublicKeyCredentialCreationOptions(pk);
  const credential = (await navigator.credentials.create({
    publicKey: options,
  })) as PublicKeyCredential & { response: AuthenticatorAttestationResponse };
  if (!credential) throw new Error('创建通行密钥失败');
  return serializeAttestation(credential);
}

/** 用 passkey 认证：begin → navigator.credentials.get → 序列化。 */
export async function authenticate(pk: Record<string, unknown>): Promise<SerializedAssertion> {
  requireBrowser();
  const options = toPublicKeyCredentialRequestOptions(pk);
  const credential = (await navigator.credentials.get({
    publicKey: options,
  })) as PublicKeyCredential & { response: AuthenticatorAssertionResponse };
  if (!credential) throw new Error('通行密钥认证失败');
  return serializeAssertion(credential);
}
