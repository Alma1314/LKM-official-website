/// <reference path="../.astro/types.d.ts" />

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
