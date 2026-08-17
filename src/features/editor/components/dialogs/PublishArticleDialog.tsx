import { useState } from "react";
import type { ReactElement } from "react";
import { t } from "~/lib/i18n";

interface PublishArticleDialogProps {
  /** 预填元数据（从当前文档 frontmatter 派生） */
  initialSlug: string;
  initialCategory: string;
  initialTags: string[];
  /** 是否正在发布（异步中） */
  publishing: boolean;
  onConfirm: (slug: string, category: string, tags: string[]) => void;
  onCancel: () => void;
}

function toSlugInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
    .slice(0, 80);
}

/**
 * 发布为文章确认框：可编辑 slug / category / tags 元数据，确认后回调父组件发布。
 * 样式与 PublishDialog 对齐（rte-dialog / rte-input）。
 */
export default function PublishArticleDialog({
  initialSlug,
  initialCategory,
  initialTags,
  publishing,
  onConfirm,
  onCancel,
}: PublishArticleDialogProps): ReactElement {
  const [slug, setSlug] = useState(initialSlug);
  const [category, setCategory] = useState(initialCategory);
  const [tags, setTags] = useState(initialTags.join(", "));

  const disabled = publishing || !slug.trim() || !category.trim();

  return (
    <div className="rte-dialog-backdrop" onClick={onCancel}>
      <div className="rte-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-1">
          {t("editor.publishArticleTitle")}
        </h3>
        <p className="text-sm text-deep-text/70 mb-4">
          {t("editor.publishArticleNotice")}
        </p>

        <label className="text-sm font-medium block mb-1">
          {t("editor.slugLabel")}
        </label>
        <input
          type="text"
          className="rte-input w-full mb-3"
          value={slug}
          onChange={(e) => setSlug(toSlugInput(e.target.value))}
          placeholder="my-article"
          autoFocus
        />

        <label className="text-sm font-medium block mb-1">
          {t("editor.categoryLabel")}
        </label>
        <input
          type="text"
          className="rte-input w-full mb-3"
          value={category}
          onChange={(e) => setCategory(e.target.value.trim())}
          placeholder={t("editor.categoryPlaceholder")}
        />

        <label className="text-sm font-medium block mb-1">
          {t("editor.tagsLabel")}
        </label>
        <input
          type="text"
          className="rte-input w-full mb-4"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={t("editor.tagsPlaceholder")}
        />

        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rte-btn rte-btn--ghost rte-btn--sm"
            disabled={publishing}
            onClick={onCancel}
          >
            {t("editor.cancel")}
          </button>
          <button
            type="button"
            className="rte-btn rte-btn--primary rte-btn--sm"
            disabled={disabled}
            onClick={() =>
              onConfirm(
                slug.trim(),
                category.trim(),
                tags
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
          >
            {publishing ? t("editor.publishing") : t("editor.confirmPublish")}
          </button>
        </div>
      </div>
    </div>
  );
}
