// src/features/editor/index.ts
// 编辑器模块入口 — 直接使用本地 DocumentEditor 组件 + 本地持久化

export { default as DocumentEditor } from './components/core/DocumentEditor';
export { createLocalPersistence } from './persistence/index';
export type { DocumentData, PersistenceAdapter } from './engine/types';
