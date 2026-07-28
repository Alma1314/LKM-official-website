---
publishDate: 2026-07-28
title: 关于 LKM
description: LKM 官网是一个静态技术博客与演示平台，基于 Astro 构建并部署在 GitHub Pages。
category: general
tags:
  - 介绍
  - LKM
  - Astro
draft: false
---

## 这是什么

LKM（理科迷）是一个面向理科爱好者与技术学习者的静态网站，基于 [Astro](https://astro.build/) 构建，托管于 GitHub Pages。

目前网站包含以下主要模块：

- **博客文章**：技术分享、学习笔记与研究心得
- **社区平台**：纯前端演示，使用 mock 数据和 localStorage 实现基本交互
- **用户账户**：localStorage 模拟的登录/注册与个人信息管理
- **富文本编辑器**：TipTap 编辑器内核，集成在浏览器端，数据仅保存在浏览器 localStorage 中

## 技术说明

本项目是一个**纯静态站点**，所有交互功能均在前端模拟实现：

- **社区与账户**：数据存储在浏览器 localStorage 中，不同设备/浏览器之间不共享，清除浏览器数据会导致数据丢失
- **编辑器**：文档内容保存在浏览器 localStorage，未持久化到任何后端服务
- **无后端服务**：网站没有数据库和 API 服务器，所有页面均为预渲染或客户端渲染的静态内容

## 项目信息

- **仓库地址**：[github.com/LKM-AHZ/LKM-official-website](https://github.com/LKM-AHZ/LKM-official-website)
- **技术栈**：Astro v7 + Tailwind CSS v4 + TypeScript
- **部署**：GitHub Pages
