import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import type { MarkdownHeading } from "astro";
import type { ImageMetadata } from "astro";
import type { Taxonomy, MetaData } from "./metadata";

export type { ImageMetadata };

export interface Post {
  /** 文章唯一标识 ID。 */
  id: string;
  /** 从文章名称派生的 URL 友好 slug。 */
  slug: string;
  /** 根据配置模式计算的完整 permalink。 */
  permalink: string;

  publishDate: Date;
  updateDate?: Date;

  title: string;
  /** 文章内容摘要（可选）。 */
  excerpt?: string;
  image?: ImageMetadata | string;

  category?: Taxonomy;
  tags?: Taxonomy[];
  author?: string;

  metadata?: MetaData;

  draft?: boolean;

  /** 文章正文的已渲染 Astro 组件工厂。 */
  Content?: AstroComponentFactory;

  /** 从 markdown 中提取的目录标题。 */
  headings?: MarkdownHeading[];

  /** 预计阅读时间（分钟）。 */
  readingTime?: number;
}
