/**
 * 数据库 Schema 设计 — Phase 1 仅作参考，Phase 2+ 接入 PostgreSQL
 *
 * 安装依赖:
 *   pnpm add drizzle-orm postgres
 *   pnpm add -D drizzle-kit @types/pg
 *
 * 使用方法:
 *   import { documents, documentVersions, assets } from '~/db/schema';
 */

// 注意：以下 import 在安装 drizzle-orm 后生效
// import { pgTable, uuid, text, integer, bigint, timestamp, jsonb } from 'drizzle-orm/pg-core';

// export const documents = pgTable('documents', {
//   id: uuid('id').primaryKey(),
//   slug: text('slug').unique().notNull(),
//   title: text('title').notNull(),
//   description: text('description'),
//   contentMdx: text('content_mdx').notNull().default(''),
//   editorJson: jsonb('editor_json'),
//   status: text('status').notNull().default('draft'),
//   version: integer('version').notNull().default(1),
//   createdBy: uuid('created_by').notNull(),
//   updatedBy: uuid('updated_by').notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
//   updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
//   publishedAt: timestamp('published_at', { withTimezone: true }),
// });

// export const documentVersions = pgTable('document_versions', {
//   id: uuid('id').primaryKey(),
//   documentId: uuid('document_id').notNull(),
//   version: integer('version').notNull(),
//   contentMdx: text('content_mdx').notNull(),
//   editorJson: jsonb('editor_json'),
//   message: text('message'),
//   createdBy: uuid('created_by').notNull(),
//   createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
// });

// export const assets = pgTable('assets', {
//   id: uuid('id').primaryKey(),
//   ownerId: uuid('owner_id').notNull(),
//   originalName: text('original_name').notNull(),
//   mimeType: text('mime_type').notNull(),
//   size: bigint('size', { mode: 'number' }).notNull(),
//   width: integer('width'),
//   height: integer('height'),
//   storageKey: text('storage_key').unique().notNull(),
//   metadata: jsonb('metadata'),
//   createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
// });
