import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const docsCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/docs' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional().default(false),

    title: z.string(),
    description: z.string().optional(),

    category: z.string(),
    tags: z.array(z.string()).optional().default([]),

    metadata: metadataDefinition(),
  }),
});

const fuwariPostsCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/posts' }),
  schema: z.object({
    title: z.string(),
    published: z.date(),
    updated: z.date().optional(),
    draft: z.boolean().optional().default(false),
    description: z.string().optional().default(''),
    image: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    category: z.string().optional().nullable().default(''),
    lang: z.string().optional().default(''),

    /* For internal use */
    prevTitle: z.string().default(''),
    prevSlug: z.string().default(''),
    nextTitle: z.string().default(''),
    nextSlug: z.string().default(''),
  }),
});

const fuwariSpecCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/content/spec' }),
  schema: z.object({}),
});

export const collections = {
  post: postCollection,
  docs: docsCollection,
  posts: fuwariPostsCollection,
  spec: fuwariSpecCollection,
};
