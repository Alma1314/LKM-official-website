import { z } from 'zod';

export interface MdxComponentDefinition<Props = Record<string, unknown>> {
  name: string;
  kind: 'inline' | 'block';
  schemaVersion: number;
  propsSchema: z.ZodSchema<Props>;
  /** 在 Tiptap 编辑器 NodeView 中渲染的 React 组件 */
  editor: React.ComponentType<Props>;
  /** 用于最终预览渲染的 React/Astro 组件 */
  preview: React.ComponentType<Props>;
  /** 从 MDAST JSX 元素节点提取 Props */
  parse: (node: unknown) => Props;
  /** 将有效 Props 序列化回 JSX 属性字符串 */
  serialize: (props: Props) => string;
  /** 从旧 Props 结构迁移（可选） */
  migrate?: (oldProps: unknown, version: number) => Props;
}
