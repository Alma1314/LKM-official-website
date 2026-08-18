/**
 * 将 TipTap JSONContent 序列化为真正的 OOXML .docx 文档。
 *
 * 使用 `docx` 库（v9）在浏览器端生成标准 Office Open XML 文件：
 *   - 标题映射到 HeadingLevel
 *   - 行内 marks（bold/italic/underline/strike/code/link）映射为 TextRun 属性
 *   - 表格映射为 Table/TableRow/TableCell
 *   - 列表通过 numbering config 生成真正的项目符号/编号
 *   - 行内/块级公式、rawMdx 以等宽代码段落呈现（Word 原生公式留待后续按需增强）
 *
 * 用法：`Packer.toBlob(new Document(buildDocxBundle(...)))` 得到 .docx Blob。
 */
import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type ISectionOptions,
  type ParagraphChild,
} from "docx";
import type { JSONContent } from "@tiptap/core";

interface MarkLike {
  type: string;
  attrs?: Record<string, string>;
}

const BULLET_CONF_ID = "editor-bullets";
const NUMBER_CONF_ID = "editor-numbers";

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
};

/** 构建 docx Document。导出核心入口。 */
export async function buildDocxBlob(
  nodes: JSONContent[],
  title?: string,
): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];
  // 可选文档标题：作为首个文档标题置顶
  if (title) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: title })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
    );
  }
  children.push(...nodes.flatMap((n) => buildBlock(n)));
  const body: ISectionOptions[] = [
    {
      properties: {},
      children,
    },
  ];

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: BULLET_CONF_ID,
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT },
            { level: 1, format: LevelFormat.BULLET, text: "\u25e6", alignment: AlignmentType.LEFT },
            { level: 2, format: LevelFormat.BULLET, text: "\u25aa", alignment: AlignmentType.LEFT },
          ],
        },
        {
          reference: NUMBER_CONF_ID,
          levels: [1, 2, 3].map((i) => ({
            level: i - 1,
            format: LevelFormat.DECIMAL,
            text: "".padEnd(i, "%") + i + ".",
            alignment: AlignmentType.LEFT,
            start: 1,
          })) as never,
        },
      ],
    },
    sections: body,
  });

  return Packer.toBlob(doc);
}

/** 处理纯文本内容并返回 Blob 下载工具函数所需的参数。 */
export { Packer };

function buildBlock(node: JSONContent): (Paragraph | Table)[] {
  const type = node.type ?? "";
  const attrs = (node.attrs ?? {}) as Record<string, string | number>;
  const content = node.content;

  switch (type) {
    case "paragraph":
      return [new Paragraph({ children: inlineRuns(node.content ?? []) })];
    case "heading": {
      const level = Math.min(Math.max(Number(attrs.level) || 1, 1), 6);
      return [
        new Paragraph({
          children: inlineRuns(node.content ?? []),
          heading: HEADING_MAP[level],
        }),
      ];
    }
    case "blockquote":
      return [
        new Paragraph({
          children: inlineRuns(node.content ?? []),
          indent: { left: 720 },
          style: "Quote",
        }),
      ];
    case "bulletList":
      return buildListItems(content ?? [], "bullet");
    case "orderedList":
      return buildListItems(content ?? [], "number");
    case "taskList":
      return buildListItems(content ?? [], "bullet");
    case "listItem":
    case "taskItem":
      return buildListItems(content ?? [], "bullet");
    case "codeBlock":
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: node.text ?? "",
              font: { name: "Consolas" },
              shading: { type: "clear", fill: "F2F2F2" },
            }),
          ],
          spacing: { after: 160 },
        }),
      ];
    case "horizontalRule":
      return [new Paragraph({ text: "--------------------", spacing: { after: 120 } })];
    case "image":
      // 图片以 base64 blob 引用实现需要异步资源加载，先以占位文本呈现
      return [
        new Paragraph({
          children: [new TextRun({ text: `[图片: ${String(attrs.alt ?? attrs.src ?? "")}]`, italics: true })],
          alignment: AlignmentType.CENTER,
        }),
      ];
    case "table": {
      const rows = (content ?? []).map((row) => buildTableRow(row));
      return [
        new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        new Paragraph({ spacing: { after: 120 } }),
      ];
    }
    case "callout": {
      const ctype = String(attrs.type ?? "info");
      const titleText = String(attrs.title ?? ctype);
      return [
        new Paragraph({ children: [new TextRun({ text: `[${ctype.toUpperCase()}] ${titleText}`, bold: true })], spacing: { before: 120, after: 120 } }),
      ];
    }
    case "figure": {
      const caption = String(attrs.caption ?? "");
      return [
        new Paragraph({ children: [new TextRun({ text: `[图片: ${String(attrs.alt ?? attrs.src ?? "")}]`, italics: true })], alignment: AlignmentType.CENTER }),
        ...(caption
          ? [new Paragraph({ children: [new TextRun({ text: caption, italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 120 } })]
          : []),
      ];
    }
    case "blockMath":
      return [
        new Paragraph({
          children: [new TextRun({ text: `$${String(attrs.latex ?? "")}$$`, font: { name: "Cambria Math" } })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
        }),
      ];
    case "rawMdx":
      return [
        new Paragraph({
          children: [new TextRun({ text: String(attrs.source ?? ""), font: { name: "Consolas" } })],
          spacing: { after: 120 },
        }),
      ];
    // 内联/文本节点不应出现在块级
    default:
      return buildInlineAsParagraph(node);
  }
}

function buildInlineAsParagraph(node: JSONContent): (Paragraph | Table)[] {
  const text = node.text ?? "";
  if (text) {
    return [new Paragraph({ children: [new TextRun(text)] })];
  }
  return buildBlockChildrenAsParagraphs(node.content ?? []);
}

function buildBlockChildrenAsParagraphs(children: JSONContent[]): (Paragraph | Table)[] {
  return children.flatMap((c) => buildBlock(c));
}

function buildListItems(
  items: JSONContent[],
  kind: "bullet" | "number",
  level = 0,
): (Paragraph | Table)[] {
  const ref =
    kind === "bullet"
      ? BULLET_CONF_ID
      : NUMBER_CONF_ID;
  return items.flatMap((item) => {
    const itemContent = item.content ?? [];
    // 列表项内部可能是 paragraph 或嵌套列表
    const paragraphs = itemContent.filter(
      (c) => c.type === "paragraph" || c.type === "heading" || c.type === "codeBlock",
    );
    const nested = itemContent.filter((c) => c && c.type && /List$/.test(c.type));
    const outerParagraphs = paragraphs.length > 0
      ? paragraphs
      : (itemContent.length > 0 ? [itemContent[0]] : []);

    const primary = outerParagraphs.map((p) => {
      return new Paragraph({
        bullet: kind === "bullet" ? { level } : undefined,
        numbering: kind === "number" ? { reference: ref, level } : undefined,
        children: inlineRuns((p.content ?? []) as JSONContent[]),
        indent: { left: 360 * (level + 1) },
      });
    });

    const nestedBlocks = nested.flatMap((n) =>
      buildListItems(n.content ?? [], n.type === "orderedList" ? "number" : "bullet", level + 1),
    );
    return [...primary, ...nestedBlocks];
  });
}

function buildTableRow(row: JSONContent): TableRow {
  const cells = (row.content ?? []).map((cell) => buildTableCell(cell));
  return new TableRow({ children: cells });
}

function buildTableCell(cell: JSONContent): TableCell {
  const isHeader = cell.type === "tableHeader";
  const children: (Paragraph | Table)[] = (cell.content ?? []).flatMap((child) =>
    buildBlock(child),
  );
  return new TableCell({
    children,
    shading: isHeader ? { type: "clear", fill: "EDEDED" } : undefined,
  });
}

/** 将一组 JSONContent 内联节点转为 ParagraphChild（TextRun / 超链接等，含 marks）。 */
function inlineRuns(nodes: JSONContent[]): ParagraphChild[] {
  const runs: ParagraphChild[] = [];
  for (const node of nodes) {
    if (node.type === "text") {
      runs.push(...textRuns(node));
    } else if (node.type === "inlineMath") {
      const latex = String((node.attrs as Record<string, string>)?.latex ?? "");
      runs.push(new TextRun({ text: `$${latex}$`, font: { name: "Cambria Math" } }));
    } else if (node.type === "image") {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      runs.push(new TextRun({ text: `[图片: ${attrs.alt ?? attrs.src ?? ""}]`, italics: true }));
    } else if (node.type === "wikiLink") {
      const attrs = (node.attrs ?? {}) as Record<string, string>;
      runs.push(new TextRun({ text: `[[${attrs.label ?? ""}]]`, color: "2E86C1" }));
    } else {
      // 已知其它内联块：扁平化其内容
      if (node.content) {
        runs.push(...inlineRuns(node.content));
      } else if (node.text) {
        runs.push(...textRuns(node));
      }
    }
  }
  return runs;
}

/** 把单个文本节点（含 marks）转为一个或多个 ParagraphChild；链接标记用 ExternalHyperlink。 */
function textRuns(node: JSONContent): ParagraphChild[] {
  const text = node.text ?? "";
  const marks = (node.marks ?? []) as MarkLike[];
  const bold = marks.some((m) => m.type === "bold");
  const italics = marks.some((m) => m.type === "italic");
  const strike = marks.some((m) => m.type === "strike");
  const underline = marks.some((m) => m.type === "underline") ? {} : undefined;
  const isCode = marks.some((m) => m.type === "code");
  const highlight = marks.some((m) => m.type === "highlight");
  const linkMark = marks.find((m) => m.type === "link");

  const run = new TextRun({
    text,
    bold,
    italics,
    strike,
    underline,
    color: "#333333",
    font: isCode ? { name: "Consolas" } : undefined,
    highlight: highlight ? "yellow" : undefined,
  });

  if (linkMark) {
    const rawHref = String(linkMark.attrs?.href ?? "#");
    // 相对内部链接（/docs/x 等）需拼成完整 URL 才能被 Word 正确视为网页链接；
    // 若运行环境无 location（如 SSR 评估路径）则退化返回原始 href。
    let href = rawHref;
    if (rawHref.startsWith("/") && typeof globalThis.location !== "undefined") {
      href = `${globalThis.location.origin}${rawHref}`;
    } else if (!/^[a-z]+:/.test(rawHref)) {
      href = `https://${rawHref}`;
    }
    // 链接用 ExternalHyperlink 包裹，生成真正的可点击超链接
    return [new ExternalHyperlink({ children: [run], link: href })];
  }
  return [run];
}
