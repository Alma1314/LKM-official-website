import React, { useState, useEffect, useMemo } from "react";
import type { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import CalloutView from "../shared/CalloutView";
import FigureView from "../shared/FigureView";

interface PreviewPanelProps {
  editor: Editor;
}

export function renderNode(node: JSONContent, key: number): React.ReactNode {
  if (!node.type) return null;

  const children = node.content?.map((c, i) => renderNode(c, i)) ?? null;

  switch (node.type) {
    case "doc":
      return (
        <div key={key} className="rte-editor-content">
          {children}
        </div>
      );
    case "paragraph":
      return <p key={key}>{children ?? node.text}</p>;
    case "heading": {
      const level = (node.attrs as Record<string, number>)?.level ?? 1;
      const HeadingTag =
        `h${Math.min(Math.max(level, 1), 6)}` as keyof React.JSX.IntrinsicElements;
      return React.createElement(HeadingTag, { key }, children ?? node.text);
    }
    case "text": {
      const text = node.text ?? "";
      const marks = node.marks ?? [];
      if (marks.some((m) => m.type === "bold"))
        return <strong key={key}>{text}</strong>;
      if (marks.some((m) => m.type === "italic"))
        return <em key={key}>{text}</em>;
      if (marks.some((m) => m.type === "strike"))
        return <del key={key}>{text}</del>;
      if (marks.some((m) => m.type === "code"))
        return <code key={key}>{text}</code>;
      if (marks.some((m) => m.type === "underline"))
        return <u key={key}>{text}</u>;
      const linkMark = marks.find((m) => m.type === "link");
      if (linkMark) {
        const href = (linkMark.attrs as Record<string, string>)?.href ?? "#";
        return (
          <a key={key} href={href} className="text-primary underline">
            {text}
          </a>
        );
      }
      return <span key={key}>{text}</span>;
    }
    case "blockquote":
      return (
        <blockquote
          key={key}
          className="border-l-4 border-surface-3 pl-4 italic"
        >
          {children}
        </blockquote>
      );
    case "bulletList":
      return (
        <ul key={key} className="list-disc pl-6">
          {children}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal pl-6">
          {children}
        </ol>
      );
    case "listItem":
    case "taskItem":
      return <li key={key}>{children}</li>;
    case "codeBlock":
      return (
        <pre key={key} className="bg-page-bg rounded-lg p-4 overflow-x-auto">
          <code>{children ?? node.text}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} className="my-6 border-surface-3" />;
    case "image": {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      return (
        <img
          key={key}
          src={attrs.src as string}
          alt={(attrs.alt as string) ?? ""}
          className="rounded-md max-w-full"
        />
      );
    }
    case "callout": {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      const ctype = (attrs.type || "info") as
        "info" | "warning" | "error" | "success";
      return (
        <CalloutView key={key} type={ctype} title={attrs.title || undefined} />
      );
    }
    case "figure": {
      const attrs = (node.attrs ?? {}) as Record<string, string | number>;
      const align = (attrs.align as "left" | "center" | "right") ?? "center";
      return (
        <FigureView
          key={key}
          src={(attrs.src as string) || undefined}
          alt={(attrs.alt as string) || undefined}
          caption={(attrs.caption as string) || undefined}
          width={(attrs.width as number) || undefined}
          align={align}
        />
      );
    }
    case "table": {
      return (
        <table key={key} className="w-full border-collapse">
          <tbody>{children}</tbody>
        </table>
      );
    }
    case "tableRow": {
      return <tr key={key}>{children}</tr>;
    }
    case "tableCell":
    case "tableHeader": {
      return (
        <td key={key} className="border border-surface-3 px-3 py-1">
          {children ?? node.text}
        </td>
      );
    }
    case "inlineMath":
    case "blockMath": {
      const latex = (node.attrs as Record<string, string>)?.latex ?? "";
      return (
        <span
          key={key}
          className={`font-mono ${node.type === "blockMath" ? "block text-center my-4" : ""}`}
        >
          ${latex}$
        </span>
      );
    }
    case "rawMdx": {
      // rawMdx 承载未在 Tiptap 结构化的 MDX 源码片段（如带正文的 Callout/Figure、未知组件）。
      // 直接展示完整源码（pre-wrap 保留换行），预览与 PDF 导出都不丢失信息；
      // 截断为 [...] 会在用户预览/导出时误导性地隐藏真实内容。
      const source = (node.attrs as Record<string, string>)?.source ?? "";
      return (
        <pre
          key={key}
          className="bg-surface-3/40 border border-surface-3 rounded p-3 text-xs whitespace-pre-wrap font-mono my-2 overflow-x-auto"
        >
          {source}
        </pre>
      );
    }
    default:
      return <span key={key}>{children ?? node.text}</span>;
  }
}

export default function PreviewPanel({
  editor,
}: PreviewPanelProps): React.ReactElement {
  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = (): void => setTick((t) => t + 1);
    // 仅监听 content update，不监听 selectionUpdate（光标移动不改变预览内容）
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  // useMemo 缓存递归渲染结果，避免 editor state 变化导致的无意义重算
  const content = useMemo(() => {
    const json = editor.getJSON();
    const nodes = (json?.content ?? []) as JSONContent[];
    return nodes.map((node, i) => renderNode(node, i));
  }, [editor.state.doc]);

  return <div className="rte-editor-content">{content}</div>;
}
