import React, { useState, useEffect, useMemo } from 'react';
import type { JSONContent } from '@tiptap/core';
import type { Editor } from '@tiptap/core';

interface PreviewPanelProps {
  editor: Editor;
}

export function renderNode(node: JSONContent, key: number): React.ReactNode {
  if (!node.type) return null;

  const children = node.content?.map((c, i) => renderNode(c, i)) ?? null;

  switch (node.type) {
    case 'doc':
      return (
        <div key={key} className="prose dark:prose-invert max-w-none">
          {children}
        </div>
      );
    case 'paragraph':
      return <p key={key}>{children ?? node.text}</p>;
    case 'heading': {
      const level = (node.attrs as Record<string, number>)?.level ?? 1;
      const HeadingTag = `h${Math.min(Math.max(level, 1), 6)}` as keyof React.JSX.IntrinsicElements;
      return React.createElement(HeadingTag, { key }, children ?? node.text);
    }
    case 'text': {
      const text = node.text ?? '';
      const marks = node.marks ?? [];
      if (marks.some((m) => m.type === 'bold')) return <strong key={key}>{text}</strong>;
      if (marks.some((m) => m.type === 'italic')) return <em key={key}>{text}</em>;
      if (marks.some((m) => m.type === 'strike')) return <del key={key}>{text}</del>;
      if (marks.some((m) => m.type === 'code')) return <code key={key}>{text}</code>;
      if (marks.some((m) => m.type === 'underline')) return <u key={key}>{text}</u>;
      const linkMark = marks.find((m) => m.type === 'link');
      if (linkMark) {
        const href = (linkMark.attrs as Record<string, string>)?.href ?? '#';
        return (
          <a key={key} href={href} className="text-primary underline">
            {text}
          </a>
        );
      }
      return <span key={key}>{text}</span>;
    }
    case 'blockquote':
      return (
        <blockquote key={key} className="border-l-4 border-base-300 pl-4 italic">
          {children}
        </blockquote>
      );
    case 'bulletList':
      return (
        <ul key={key} className="list-disc pl-6">
          {children}
        </ul>
      );
    case 'orderedList':
      return (
        <ol key={key} className="list-decimal pl-6">
          {children}
        </ol>
      );
    case 'listItem':
    case 'taskItem':
      return <li key={key}>{children}</li>;
    case 'codeBlock':
      return (
        <pre key={key} className="bg-base-200 rounded-lg p-4 overflow-x-auto">
          <code>{children ?? node.text}</code>
        </pre>
      );
    case 'horizontalRule':
      return <hr key={key} className="my-6 border-base-300" />;
    case 'image': {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      return (
        <img key={key} src={attrs.src as string} alt={(attrs.alt as string) ?? ''} className="rounded-md max-w-full" />
      );
    }
    case 'callout': {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      const ctype = (attrs.type || 'info') as string;
      const alertClass =
        {
          info: 'alert-info',
          warning: 'alert-warning',
          error: 'alert-error',
          success: 'alert-success',
        }[ctype] ?? 'alert-info';
      return (
        <div key={key} className={`alert ${alertClass} my-4`}>
          <span>{attrs.title || ctype}</span>
        </div>
      );
    }
    case 'figure': {
      const attrs = (node.attrs ?? {}) as Record<string, string | number>;
      const align = (attrs.align as string) ?? 'center';
      return (
        <figure
          key={key}
          className={`my-4 ${align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'}`}
        >
          {(attrs.src as string) ? (
            <img
              src={attrs.src as string}
              alt={(attrs.alt as string) ?? ''}
              className="rounded-md inline-block max-w-full"
              style={{ width: attrs.width ? `${attrs.width}px` : 'auto' }}
            />
          ) : (
            <div className="border-2 border-dashed border-base-300 rounded-lg p-8 text-base-content/50">暂无图片</div>
          )}
          {attrs.caption && (
            <figcaption className="text-xs text-base-content/60 mt-1">{attrs.caption as string}</figcaption>
          )}
        </figure>
      );
    }
    case 'table': {
      return (
        <table key={key} className="w-full border-collapse">
          <tbody>{children}</tbody>
        </table>
      );
    }
    case 'tableRow': {
      return <tr key={key}>{children}</tr>;
    }
    case 'tableCell':
    case 'tableHeader': {
      return (
        <td key={key} className="border border-base-300 px-3 py-1">
          {children ?? node.text}
        </td>
      );
    }
    case 'inlineMath':
    case 'blockMath': {
      const latex = (node.attrs as Record<string, string>)?.latex ?? '';
      return (
        <span key={key} className={`font-mono ${node.type === 'blockMath' ? 'block text-center my-4' : ''}`}>
          ${latex}$
        </span>
      );
    }
    case 'rawMdx': {
      const source = ((node.attrs as Record<string, string>)?.source ?? '').slice(0, 60);
      return (
        <div key={key} className="bg-warning/10 border border-warning/40 rounded p-3 text-sm text-warning my-2">
          [MDX: {source}...]
        </div>
      );
    }
    default:
      return <span key={key}>{children ?? node.text}</span>;
  }
}

export default function PreviewPanel({ editor }: PreviewPanelProps) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    // 仅监听 content update，不监听 selectionUpdate（光标移动不改变预览内容）
    editor.on('update', handler);
    return () => {
      editor.off('update', handler);
    };
  }, [editor]);

  // useMemo 缓存递归渲染结果，避免 editor state 变化导致的无意义重算
  const content = useMemo(() => {
    const json = editor.getJSON();
    const nodes = (json?.content ?? []) as JSONContent[];
    return nodes.map((node, i) => renderNode(node, i));
  }, [editor.state.doc]);

  return <div className="min-h-[60vh] px-8 py-6 bg-base-100">{content}</div>;
}
