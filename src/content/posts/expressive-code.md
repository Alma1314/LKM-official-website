---
title: 代码块功能展示
published: 2026-07-20
description: 展示网站支持的代码高亮与代码块样式能力。
tags: [Markdown, 代码, 展示]
category: 示例
draft: false
---

本文展示本站支持的代码块语法高亮和相关功能。

## 语法高亮

本站使用 Astro 内置的代码高亮方案，支持多种编程语言的语法着色。

### JavaScript 示例

```js
console.log('这是一段语法高亮的代码！');
```

### TypeScript 示例

```ts
interface User {
  name: string;
  age: number;
}

function greet(user: User): string {
  return `你好，${user.name}！`;
}
```

### Python 示例

```python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)
```

### Bash 示例

```bash
# 构建项目
pnpm build

# 检查类型
pnpm astro check
```

## 代码块标题

可以通过在语言标记后添加 `title` 属性来给代码块添加标题：

```js title="hello.js"
console.log('Hello, 理科迷！');
```

## 行号

代码块可以显示行号，方便在文章中引用特定行：

```js showLineNumbers
function add(a, b) {
  return a + b;
}

console.log(add(1, 2));
```

## 差异对比

使用 `diff` 语言标记展示代码变更：

```diff
+这是新增的代码行
-这是删除的代码行
 这是未修改的代码行
```

也可以结合其他语言使用：

```diff lang="js"
  function greet(name) {
-   console.log('Hello ' + name);
+   console.log(`你好，${name}！`);
  }
```

## 行高亮

通过在语言标记后指定行号参数来高亮特定行：

```js {2, 4}
// 第 1 行
// 第 2 行 —— 被高亮
// 第 3 行
// 第 4 行 —— 被高亮
```
