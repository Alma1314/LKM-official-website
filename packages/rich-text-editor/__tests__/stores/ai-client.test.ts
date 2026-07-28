import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateAiEndpoint, requestAiCompletion, setAiConfig, clearAiConfig } from '../../src/stores/ai-client';

const DEFAULT_ENDPOINT = 'https://api.openai.com';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

describe('validateAiEndpoint', () => {
  it('rejects empty string', () => {
    const result = validateAiEndpoint('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
  });

  it('rejects http:// URLs', () => {
    const result = validateAiEndpoint('http://api.openai.com');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/https/i);
    }
  });

  it('rejects javascript: pseudo-URLs', () => {
    const result = validateAiEndpoint('javascript:alert(1)');
    expect(result.ok).toBe(false);
  });

  it('rejects URLs with username:password', () => {
    const result = validateAiEndpoint('https://user:pass@api.openai.com');
    expect(result.ok).toBe(false);
  });

  it('rejects URLs with username only', () => {
    const result = validateAiEndpoint('https://user@evil.com');
    expect(result.ok).toBe(false);
  });

  it('rejects data: URLs', () => {
    const result = validateAiEndpoint('data:text/html,<script>alert(1)</script>');
    expect(result.ok).toBe(false);
  });

  it('rejects file: URLs', () => {
    const result = validateAiEndpoint('file:///etc/passwd');
    expect(result.ok).toBe(false);
  });

  it('accepts a plain HTTPS URL without trailing slash', () => {
    const result = validateAiEndpoint('https://api.openai.com');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.href).toBe('https://api.openai.com/');
    }
  });

  it('normalises trailing slash on a bare HTTPS domain', () => {
    const result = validateAiEndpoint('https://example.com/api');
    expect(result.ok).toBe(true);
    if (result.ok) {
      // Only HTTPS, no credentials, no fragment
      expect(result.value.protocol).toBe('https:');
      expect(result.value.username).toBe('');
      expect(result.value.password).toBe('');
      expect(result.value.hash).toBe('');
    }
  });

  it('accepts localhost HTTPS (for local development)', () => {
    const result = validateAiEndpoint('https://localhost:11434/v1');
    expect(result.ok).toBe(true);
  });
});

describe('requestAiCompletion (mocked fetch)', () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    // Clear in-memory config before each test
    clearAiConfig();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockFetch(responseInit: ResponseInit, body: unknown) {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(body), responseInit)) as unknown as typeof fetch;
  }

  function mockFetchRaw(responseInit: ResponseInit, body: string) {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(body, responseInit)) as unknown as typeof fetch;
  }

  const input = {
    prompt: '',
    context: 'Hello world',
    operation: '续写',
  };

  it('requires config to be set first', async () => {
    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/配置/);
    }
  });

  it('sends a completion request and returns the text', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key-123', DEFAULT_MODEL);
    mockFetch(
      { status: 200, headers: { 'content-type': 'application/json' } },
      { choices: [{ message: { content: '续写结果' } }] }
    );

    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('续写结果');
    }
  });

  it('rejects response exceeding 262144 bytes', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key', DEFAULT_MODEL);
    const bigText = 'x'.repeat(300_000);
    mockFetch(
      { status: 200, headers: { 'content-type': 'application/json' } },
      { choices: [{ message: { content: bigText } }] }
    );

    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/大|size|字节|limit/i);
    }
  });

  it('rejects response missing the text field', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key', DEFAULT_MODEL);
    mockFetch({ status: 200, headers: { 'content-type': 'application/json' } }, { choices: [{ message: {} }] });

    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeTruthy();
    }
  });

  it('rejects non-JSON content-type response', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key', DEFAULT_MODEL);
    mockFetchRaw({ status: 200, headers: { 'content-type': 'text/html' } }, '<html>not json</html>');

    const result = await requestAiCompletion(input);
    // Either fails parsing or rejects upfront from content-type check
    expect(result.ok).toBe(false);
  });

  it('handles cancellation via AbortSignal', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key', DEFAULT_MODEL);
    const controller = new AbortController();

    // Abort immediately
    controller.abort();

    const result = await requestAiCompletion(input, { signal: controller.signal });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/取消|abort|cancel/i);
    }
  });

  it('handles timeout (simulated)', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key', DEFAULT_MODEL);
    const controller = new AbortController();

    // Simulate timeout: AbortSignal that fires after a short delay
    // We test that timeout errors are safe messages
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new DOMException('The operation was aborted', 'AbortError'));
      }, 50);
    });

    globalThis.fetch = vi.fn().mockReturnValue(timeoutPromise) as unknown as typeof fetch;

    // requestAiCompletion uses its own 15s timeout; we test external cancel
    const result = await requestAiCompletion(input, { signal: controller.signal }).catch(() => ({
      ok: false as const,
      error: 'aborted',
    }));

    expect(result.ok).toBe(false);
  });

  it('requires HTTPS in the configured endpoint before sending', async () => {
    const fetchSpy = vi.fn().mockResolvedValue(
      new Response('{}', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    );
    globalThis.fetch = fetchSpy as unknown as typeof fetch;

    setAiConfig('http://evil.com', 'key', DEFAULT_MODEL);

    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Should reject before sending any fetch
      expect(fetchSpy).not.toHaveBeenCalled();
    }
  });

  it('error text never contains the api key', async () => {
    const secretKey = 'sk-secret-key-that-must-not-leak-12345';
    setAiConfig(DEFAULT_ENDPOINT, secretKey, DEFAULT_MODEL);

    // Simulate a server error
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: { message: 'Invalid API key provided' } }), {
        status: 401,
        headers: { 'content-type': 'application/json' },
      })
    ) as unknown as typeof fetch;

    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // The error message must NOT contain the actual key
      expect(result.error).not.toContain(secretKey);
      // Also must not contain secrets from config
      expect(result.error).not.toContain('sk-secret');
    }
  });

  it('error text never contains full response document on server error', async () => {
    setAiConfig(DEFAULT_ENDPOINT, 'test-key', DEFAULT_MODEL);

    // Simulate a huge error page body
    const hugeErrorBody = 'Error: ' + 'x'.repeat(5000);
    globalThis.fetch = vi.fn().mockResolvedValue(
      new Response(hugeErrorBody, {
        status: 500,
        headers: { 'content-type': 'text/plain' },
      })
    ) as unknown as typeof fetch;

    const result = await requestAiCompletion(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      // Should truncate, not include the full 5000-char body
      expect(result.error.length).toBeLessThan(hugeErrorBody.length);
    }
  });

  it('default endpoint is usable when no custom endpoint is set', async () => {
    // setAiConfig with DEFAULT_ENDPOINT should be accepted
    const validation = validateAiEndpoint(DEFAULT_ENDPOINT);
    expect(validation.ok).toBe(true);
  });
});
