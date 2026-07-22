import type { Editor } from '@tiptap/core';
import type { ReactNode } from 'react';

export type SaveStatus = 'saved' | 'unsaved' | 'saving' | 'error' | 'conflict';

export interface ToolbarItem {
  key: string;
  icon: ReactNode;
  label: string;
  title: string;
  group: 'format' | 'heading' | 'block' | 'list' | 'insert' | 'history';
  action: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

export interface DocumentMeta {
  id: string;
  title: string;
  lastModified: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
}

export interface DocumentData extends DocumentMeta {
  contentMdx: string;
  editorJson: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutosavePayload {
  contentMdx: string;
  editorJson: Record<string, unknown>;
  baseVersion: number;
}

export interface AutosaveResponse {
  ok: boolean;
  version: number;
  code?: 'VERSION_CONFLICT';
  currentVersion?: number;
}
