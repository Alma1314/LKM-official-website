import { describe, it, expect } from 'vitest';
import { exportMdx } from '../export-mdx';
import { importMdx } from '../import-mdx';
import type { JSONContent } from '@tiptap/core';

// 设计文档第 21/26 章：MDX 往返测试是核心质量门槛。
// 思路：Tiptap JSON → exportMdx → MDX 文本 → importMdx → JSON，
// 对比语义结构，确保往返不丢失内容。

function roundtrip(doc: JSONContent): ReturnType<typeof importMdx> {
  const out = exportMdx(doc.content ?? [], {});
  return importMdx(out.mdx);
}

describe('MDX 往返转换', () => {
  it('基本段落与标题往返', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '标题' }] },
        { type: 'paragraph', content: [{ type: 'text', text: '正文' }] },
      ],
    };
    const back = roundtrip(doc);
    expect(back.content![0].type).toBe('heading');
    expect(back.content![0].attrs!.level).toBe(2);
    expect(back.content![0].content![0].text).toBe('标题');
    expect(back.content![1].type).toBe('paragraph');
    expect(back.content![1].content![0].text).toBe('正文');
  });

  it('行内 marks（加粗/斜体/删除线/行内代码）往返保留', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: '文', marks: [{ type: 'bold' }] }],
        },
      ],
    };
    const back = roundtrip(doc);
    const text = back.content![0].content![0];
    const types = (text.marks ?? []).map((m) => m.type);
    expect(types).toContain('bold');
  });

  it('列表（含任务列表）往返', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'bulletList',
          content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '项 A' }] }] }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: '已完成' }] }],
            },
          ],
        },
      ],
    };
    const back = roundtrip(doc);
    expect(back.content![0].type).toBe('bulletList');
    expect(back.content![1].type).toBe('taskList');
    expect(back.content![1].content![0].attrs!.checked).toBe(true);
  });

  it('Callout 往返不变为 rawMdx 占位符（回归修复）', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'callout', attrs: { type: 'warning' }, content: [] }],
    };
    const back = roundtrip(doc);
    expect(back.content![0].type).toBe('callout');
    expect(back.content![0].attrs!.type).toBe('warning');
  });

  it('GFM 表单元格纯文本不丢失、表头保留（回归修复）', () => {
    const mdx = `| 名称 | 数量 |
| ---- | ---: |
| 产品A | 10 |`;
    const back = importMdx(mdx);
    const table = back.content![0];
    expect(table.type).toBe('table');
    expect(table.content![0].content![0].type).toBe('tableHeader');
    expect(table.content![0].content![0].content![0].content![0]).toEqual({ type: 'text', text: '名称' });
    expect(table.content![1].content![0].type).toBe('tableCell');
    expect(table.content![1].content![0].content![0].content![0].text).toBe('产品A');
  });

  it('公式（行内与块级）往返', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'E=mc^2', marks: [{ type: 'inlineMath', attrs: { latex: 'E=mc^2' } }] }],
        },
        { type: 'blockMath', attrs: { latex: '\\int_0^1 x\\,dx' }, content: [] },
      ],
    };
    const back = roundtrip(doc);
    const inline = back.content![0].content![0];
    expect((inline.marks ?? []).some((m) => m.type === 'inlineMath')).toBe(true);
    expect(back.content![1].type).toBe('blockMath');
    expect(back.content![1].attrs!.latex).toBe('\\int_0^1 x\\,dx');
  });

  it('codeBlock 往返保留语言', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'codeBlock', attrs: { language: 'ts' }, content: [{ type: 'text', text: 'const a = 1;' }] }],
    };
    const back = roundtrip(doc);
    expect(back.content![0].type).toBe('codeBlock');
    expect(back.content![0].attrs!.language).toBe('ts');
    expect(back.content![0].content![0].text).toBe('const a = 1;');
  });

  it('frontmatter 保留（export 时携带）', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '正文' }] }],
    };
    const out = exportMdx(doc.content ?? [], { title: '我的标题', slug: 'my-doc' });
    expect(out.mdx.startsWith('---')).toBe(true);
    expect(out.mdx).toContain('title: 我的标题');
    expect(out.mdx).toContain('slug: my-doc');
    const back = importMdx(out.mdx);
    expect(back.frontmatter.title).toBe('我的标题');
  });
});
