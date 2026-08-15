import type { Editor } from '@tiptap/core';
import { serializeHtml } from '../../engine/serialize-html';

export function handleExportHtml(editor: Editor): void {
  try {
    const json = editor.getJSON();
    const content = (json?.content ?? []) as Parameters<typeof serializeHtml>[0];
    const body = serializeHtml(content);
    const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>导出的文档</title>
<style>
  body { font-family: 'Noto Sans SC', system-ui, sans-serif; font-size: 12pt; line-height: 1.8; color: #333; max-width: 720px; margin: 2rem auto; padding: 0 1rem; }
  h1 { font-size: 24pt; margin: 0.8em 0 0.4em; }
  h2 { font-size: 18pt; margin: 0.7em 0 0.3em; }
  h3 { font-size: 14pt; margin: 0.6em 0 0.3em; }
  p { margin: 0.3em 0; }
  blockquote { border-left: 3px solid #ccc; padding-left: 1em; color: #666; font-style: italic; }
  pre { background: #f5f5f5; padding: 1em; border-radius: 4px; overflow-x: auto; }
  code { background: #f0f0f0; padding: 0.1em 0.3em; border-radius: 2px; font-size: 0.9em; }
  table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  td, th { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
  ul, ol { padding-left: 2em; }
  img { max-width: 100%; height: auto; }
  figure { margin: 1em 0; text-align: center; }
  figcaption { font-size: 10pt; color: #888; margin-top: 0.3em; }
  .callout { padding: 0.8em 1em; border-radius: 6px; margin: 0.8em 0; border: 1px solid; }
  .callout-info { background: #e8f4fd; border-color: #b6d4fe; }
  .callout-warning { background: #fff3cd; border-color: #ffeeba; }
  .callout-error { background: #f8d7da; border-color: #f5c6cb; }
  .callout-success { background: #d4edda; border-color: #c3e6cb; }
  .math-block, .math-inline { font-family: 'JetBrains Mono', monospace; }
</style>
</head>
<body>${body}</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert('导出失败: ' + (err as Error).message);
  }
}
