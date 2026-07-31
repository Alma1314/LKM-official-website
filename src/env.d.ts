/// <reference path="../.astro/types.d.ts" />
/// <reference path="./core/global.d.ts" />

// Svelte Language Server 通过快照运行独立 tsc 实例，不总能跟随
// <reference> 发现 global.d.ts；在此直接追加声明。
interface Window {
  pagefind: {
    search: (query: string) => Promise<{
      results: Array<{
        data: () => Promise<{
          url: string;
          meta: { title: string };
          excerpt: string;
          content?: string;
          word_count?: number;
          filters?: Record<string, unknown>;
          anchors?: Array<{ element: string; id: string; text: string; location: number }>;
          weighted_locations?: Array<{ weight: number; balanced_score: number; location: number }>;
          locations?: number[];
          raw_content?: string;
          raw_url?: string;
        }>;
      }>;
    }>;
  };
}

declare module '*.yaml?raw' {
  const content: string;
  export default content;
}

declare module '*.yml?raw' {
  const content: string;
  export default content;
}

declare module 'virtual:config' {
  const config: Record<string, unknown>;
  export default config;
}
