---
title: 文章中嵌入视频
published: 2026-07-19
description: 展示如何在 Markdown 文章中嵌入来自 YouTube、Bilibili 等平台的视频。
tags: [示例, 视频, 媒体]
category: 示例
draft: false
---

将视频平台的嵌入代码直接粘贴到 Markdown 文件中即可。以下是两个示例。

## YouTube

<iframe width="100%" height="468" src="https://www.youtube.com/embed/5gIf0_xpFPI?si=N1WTorLKL0uwLsU_" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## Bilibili

<iframe width="100%" height="468" src="//player.bilibili.com/player.html?bvid=BV1fK4y1s7Qf&p=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 使用方法

1. 在视频平台找到"分享"或"嵌入"按钮
2. 复制 iframe 代码
3. 粘贴到 Markdown 文件中想要的位置
4. 建议设置 `width="100%"` 让视频自适应宽度

其他支持嵌入视频的平台同样适用此方法（如 Vimeo、腾讯视频等），只需替换 `src` 地址即可。
