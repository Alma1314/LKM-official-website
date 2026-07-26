// src/features/editor/index.ts
// 薄适配层：组装 editor 包 + persistence 包，导出给 Astro 页面使用
import { EditorMount, type PersistenceAdapter } from '@lkm/rich-text-editor';
import { createLocalPersistence } from '@lkm/editor-persistence';

const persistence = createLocalPersistence();

// 封装后的 EditorMount，页面直接使用
export { EditorMount, persistence };
export type { PersistenceAdapter };
