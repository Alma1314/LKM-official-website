// 组件
export { default as EditorMount } from './components/core/EditorMount';
export type { EditorMountProps } from './components/core/EditorMount';

// engine — 纯函数
export { getEditorExtensions } from './engine/extensions/index';
export { exportMdx, importMdx } from './engine/mdx/index';
export type { ImportResult } from './engine/mdx/import-mdx';
export type {
  EditorMode,
  SaveStatus,
  DocumentData,
  DocumentMeta,
  DocumentSummary,
  AutosavePayload,
  AutosaveResponse,
} from './engine/types';

// 持久化接口
export type { PersistenceAdapter, VersionEntry, BackupEntry, CommentThread, CommentReply } from './engine/types';

// hooks（高级用法）
export { useEditorPersistence } from './hooks/useEditorPersistence';
export { useAutoSave } from './hooks/autosave';
