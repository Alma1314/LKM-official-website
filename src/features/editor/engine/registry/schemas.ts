import { z } from 'astro/zod';

export const calloutPropsSchema = z.object({
  type: z.enum(['info', 'warning', 'error', 'success']).default('info'),
  title: z.string().optional().default(''),
});

export const figurePropsSchema = z.object({
  assetId: z.string().default(''),
  src: z.string().optional().default(''),
  alt: z.string().default(''),
  caption: z.string().optional().default(''),
  width: z.number().optional(),
  align: z.enum(['left', 'center', 'right']).default('center'),
});

export type CalloutProps = z.infer<typeof calloutPropsSchema>;
export type FigureProps = z.infer<typeof figurePropsSchema>;
