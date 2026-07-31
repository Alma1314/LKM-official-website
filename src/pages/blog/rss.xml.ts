import rss from '@astrojs/rss';
import { getSortedPosts } from '~/core/utils/content-utils';
import { url } from '~/core/utils/url-utils';
import type { APIContext } from 'astro';
import MarkdownIt from 'markdown-it';
import sanitizeHtml from 'sanitize-html';
import { siteConfig } from '~/core/config';

const parser = new MarkdownIt();

// Valid XML characters per https://www.w3.org/TR/xml/#charsets
// eslint-disable-next-line no-control-regex
const INVALID_XML_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g;

function stripInvalidXmlChars(str: string): string {
  return str.replace(INVALID_XML_CHARS, '');
}

interface PostEntry {
  id: string;
  data: {
    title?: string;
    published?: Date;
    description?: string;
  };
  body?: string;
}

export async function GET(context: APIContext) {
  const blog = await getSortedPosts();

  const getSlug = (entry: PostEntry): string => entry.id.replace(/^posts\//, '').replace(/\.(md|mdx)$/, '');

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site: context.site ?? 'https://fuwari.vercel.app',
    items: blog.map((post: PostEntry) => {
      const data = post.data || {};
      const content = post.body ? String(post.body) : '';
      const cleanedContent = stripInvalidXmlChars(content);
      return {
        title: data.title ?? '',
        pubDate: data.published ?? new Date(),
        description: data.description || '',
        link: url(`/blog/posts/${getSlug(post)}/`),
        content: sanitizeHtml(parser.render(cleanedContent), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
          },
        }),
      };
    }),
    customData: `<language>${siteConfig.lang}</language>`,
  });
}
