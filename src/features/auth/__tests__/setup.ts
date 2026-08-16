import "@vue/test-utils";

// happy-dom v20 的 localStorage 仅在 BrowserWindow 上提供，vitest 使用的基础 Window
// 不包含它，这里用内存版 Storage 顶替。
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
}

Object.defineProperty(globalThis, "localStorage", {
  value: new MemoryStorage(),
  configurable: true,
  writable: true,
});

// 站点配置默认语言为 zh-CN，测试断言基于中文文案；预置 locale 使 i18n 解析一致。
localStorage.setItem("lkm-locale", "zh-CN");
