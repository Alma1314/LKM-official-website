---
title: Markdown 扩展功能
published: 2026-07-20
updated: 2026-07-28
description: 本站支持的 Markdown 扩展语法与功能。
image: ''
tags: [示例, Markdown, 功能]
category: 示例
draft: false
---

本文介绍本站 Markdown 渲染链支持的扩展语法。

## 提示框（Admonitions）

支持以下类型的提示框：`note`、`tip`、`important`、`warning`、`caution`。

:::note
这是一条说明信息，即使在跳读时也值得关注。
:::

:::tip
帮助用户更高效使用功能的小技巧。
:::

:::important
用户成功操作所必需的关键信息。
:::

:::warning
需要注意潜在风险的警告信息。
:::

:::caution
描述操作可能带来的负面影响。
:::

### 基本语法

```markdown
:::note
说明信息
:::

:::tip
提示信息
:::
```

### 自定义标题

可以自定义提示框的标题：

:::note[自定义标题]
这是一个带自定义标题的提示框。
:::

```markdown
:::note[自定义标题]
这是一个带自定义标题的提示框。
:::
```

### GitHub 语法

也支持 GitHub 风格的提示语法：

> [!TIP]
> GitHub 风格的提示语法同样可用。

```markdown
> [!NOTE]
> 说明信息

> [!TIP]
> 提示信息
```

## 数学公式

本站支持 KaTeX 数学公式渲染。

行内公式：$E = mc^2$

块级公式：

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

多行对齐公式：

$$
\begin{equation*}
\pi = 3.1415926535
\end{equation*}
$$
