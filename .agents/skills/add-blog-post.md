# 添加博客文章

## 步骤

1. 在 `src/content/posts/` 下创建新的 `.md` 或 `.mdx` 文件
2. 添加必需的 frontmatter：

```yaml
---
title: '文章标题'
published: 2026-01-15
description: '文章描述'
image: '~/assets/images/your-image.png'
category: 'tutorials'
tags:
  - astro
  - tailwind
draft: false
---
```

3. 使用 Markdown 编写内容（如需嵌入组件可使用 MDX）
4. 运行 `pnpm run build` 验证文章正确渲染

## Frontmatter 字段

| 字段          | 是否必填 | 说明                                         |
| ------------- | -------- | -------------------------------------------- |
| `title`       | 是       | 文章标题                                     |
| `published`   | 是       | 发布日期                                     |
| `updated`     | 否       | 更新日期                                     |
| `draft`       | 否       | 设为 `true` 则不在列表中显示（默认 `false`） |
| `description` | 否       | 文章描述/摘要                                |
| `image`       | 否       | 封面图路径（本地图片用 `~/` 前缀）           |
| `category`    | 否       | 单个分类名称                                 |
| `tags`        | 否       | 标签数组                                     |
| `lang`        | 否       | 语言（默认空字符串）                         |

## URL 模式

文章路径为 `/blog/{slug}`，slug 由文件名生成。

## 注意事项

- 阅读时间由 remark 插件自动计算
- 使用 `~/` 引用的图片在构建时自动优化
- 使用 `.mdx` 扩展名可在文章中嵌入 Astro 组件
