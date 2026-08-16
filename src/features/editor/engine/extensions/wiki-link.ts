import { Node } from "@tiptap/core";

/**
 * WikiLink 自定义节点：Obsidian 式 markdown 双链（[[label|href]]）的编辑器内原子节点。
 * attrs: { href, label }
 */
export const WikiLink = Node.create({
  name: "wikiLink",

  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      href: { default: "" },
      label: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-wiki-link]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { href, ...rest } = HTMLAttributes as Record<string, unknown>;
    // href 为空 = 未解析到已发布文档 → 输出 data-resolved 以应用「未解析」虚线样式
    const resolved = href ? {} : { "data-resolved": "" };
    return ["span", { "data-wiki-link": "", ...resolved, ...rest }];
  },
});
