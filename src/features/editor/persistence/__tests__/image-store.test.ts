import { describe, it, expect } from 'vitest';
import { collectImageSrcs } from '../image-store';

describe('image-store 纯逻辑', () => {
  it('collectImageSrcs 收集嵌套 image 节点 src', () => {
    const json = {
      type: 'doc',
      content: [
        { type: 'image', attrs: { src: 'blob:a', alt: '' } },
        {
          type: 'paragraph',
          content: [{ type: 'image', attrs: { src: 'http://x/y.png', alt: '' } }],
        },
        { type: 'text', text: 'no img' },
      ],
    };
    expect(collectImageSrcs(json)).toEqual(['blob:a', 'http://x/y.png']);
  });

  it('对空/无图片文档返回空数组', () => {
    expect(collectImageSrcs({ type: 'doc', content: [] })).toEqual([]);
    expect(collectImageSrcs(null)).toEqual([]);
    expect(collectImageSrcs(undefined)).toEqual([]);
  });
});
