---
title: Markdown 基础语法
published: 2026-07-18
description: Markdown 基础语法示例与实际渲染效果。
tags: [Markdown, 语法, 示例]
category: 示例
draft: false
---

# 一级标题

段落之间用空行分隔。

第二个段落。_斜体_、**粗体**、`行内代码`。无序列表：

- 第一项
- 第二项
- 第三项

## 二级标题

有序列表：

1. 第一项
2. 第二项
3. 第三项

> 引用块是这样写的。
>
> 它们可以跨越多段，
> 也可以嵌套使用。

## 代码块

使用三个反引号标明代码块：

```
define foobar() {
    print "欢迎来到 LKM！";
}
```

带语言标记的语法高亮：

```python
import time

for i in range(10):
    time.sleep(0.5)
    print(i)
```

### 嵌套列表

1. 第一步，准备食材：
   - 胡萝卜
   - 芹菜
   - 扁豆

2. 第二步，烧开水。

3. 第三步，放入锅中炖煮。

链接示例：[Astro 官网](https://astro.build/)，以及[回到顶部](#一级标题)。

## 表格

| 尺寸 | 材质 | 颜色 |
| ---- | ---- | ---- |
| 9    | 皮革 | 棕色 |
| 10   | 帆布 | 本色 |
| 11   | 玻璃 | 透明 |

## 分割线

---

## 图片

![示例图片](https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80 '示例图片')

## 数学公式

行内公式：$\omega = d\phi / dt$

块级公式：

$$I = \int \rho R^{2} dV$$
