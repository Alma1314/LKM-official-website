import type { z } from 'astro/zod';

export interface MdxComponentDefinition<Props = Record<string, unknown>> {
  name: string;
  kind: 'inline' | 'block';
  schemaVersion: number;
  propsSchema: z.ZodSchema<Props>;
  /** React component rendered inside the Tiptap editor NodeView */
  editor: React.ComponentType<Props>;
  /** React/Astro component for final preview rendering */
  preview: React.ComponentType<Props>;
  /** Extract Props from an MDAST JSX element node */
  parse: (node: unknown) => Props;
  /** Serialize valid Props back to a JSX attribute string */
  serialize: (props: Props) => string;
  /** Optional migration from old prop shapes */
  migrate?: (oldProps: unknown, version: number) => Props;
}
