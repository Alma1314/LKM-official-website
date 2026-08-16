/**
 * 专栏 mock 数据 — 用户可见字段（title/description/excerpt/author 信息/tags）已替换为 i18n key，
 * 渲染时需用 t(field) 显示。article.content 为正文 Markdown，保持原文。
 */

export interface MockColumn {
  id: string;
  authorId: string;
  authorName: string;
  authorTitle: string;
  authorBio: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  isVerified: boolean;
  followerCount: number;
  articleCount: number;
}

export interface MockColumnArticle {
  id: string;
  columnId: string;
  columnSlug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
}

export const mockColumns: MockColumn[] = [
  {
    id: 'col-1',
    authorId: 'user-qiyue-o',
    authorName: 'columnData.columns.col1.authorName',
    authorTitle: 'columnData.columns.col1.authorTitle',
    authorBio: 'columnData.columns.col1.authorBio',
    title: 'columnData.columns.col1.title',
    slug: 'cosmic-notes',
    description: 'columnData.columns.col1.description',
    isVerified: true,
    followerCount: 1200,
    articleCount: 15,
  },
  {
    id: 'col-2',
    authorId: 'user-qiyue-hua',
    authorName: 'columnData.columns.col2.authorName',
    authorTitle: 'columnData.columns.col2.authorTitle',
    authorBio: 'columnData.columns.col2.authorBio',
    title: 'columnData.columns.col2.title',
    slug: 'edu-lab',
    description: 'columnData.columns.col2.description',
    isVerified: true,
    followerCount: 890,
    articleCount: 8,
  },
  {
    id: 'col-3',
    authorId: 'user-col-3',
    authorName: 'columnData.columns.col3.authorName',
    authorTitle: 'columnData.columns.col3.authorTitle',
    authorBio: 'columnData.columns.col3.authorBio',
    title: 'columnData.columns.col3.title',
    slug: 'academic-writing',
    description: 'columnData.columns.col3.description',
    isVerified: true,
    followerCount: 650,
    articleCount: 12,
  },
  {
    id: 'col-4',
    authorId: 'user-col-4',
    authorName: 'columnData.columns.col4.authorName',
    authorTitle: 'columnData.columns.col4.authorTitle',
    authorBio: 'columnData.columns.col4.authorBio',
    title: 'columnData.columns.col4.title',
    slug: 'algorithm-beauty',
    description: 'columnData.columns.col4.description',
    isVerified: false,
    followerCount: 450,
    articleCount: 20,
  },
];

export const mockColumnArticles: MockColumnArticle[] = [
  {
    id: 'art-1',
    columnId: 'col-1',
    columnSlug: 'cosmic-notes',
    title: 'columnData.articles.art1.title',
    excerpt: 'columnData.articles.art1.excerpt',
    content: `## 引力波天文学：聆听宇宙的"声音"

2015年9月14日，LIGO探测器首次直接探测到引力波信号——GW150914。这是两个约30倍太阳质量的黑洞合并产生的时空涟漪。

### 什么是引力波？

引力波是时空曲率的扰动，以光速传播。爱因斯坦在1916年基于广义相对论预言了它的存在。

### 探测原理

LIGO使用激光干涉仪，两条4公里长的臂垂直排列。当引力波经过时，臂长发生极其微小的变化（约质子直径的千分之一）。

### 主要发现

截至2026年，LIGO/Virgo/KAGRA合作组已探测到超过90个引力波事件，包括：

- 双黑洞合并
- 双中子星合并（GW170817，伴随着电磁对应体）
- 中子星-黑洞合并

引力波天文学已经从一个"梦想"变成了一个蓬勃发展的领域。`,
    tags: ['columnData.articles.art1.tags.a', 'columnData.articles.art1.tags.b', 'columnData.articles.art1.tags.c'],
    viewCount: 3400,
    likeCount: 256,
    commentCount: 42,
    createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'art-2',
    columnId: 'col-1',
    columnSlug: 'cosmic-notes',
    title: 'columnData.articles.art2.title',
    excerpt: 'columnData.articles.art2.excerpt',
    content: `## 黑洞信息悖论

### 问题的起源

1974年，霍金发现黑洞并非完全"黑"——它会通过量子效应辐射能量（霍金辐射），最终完全蒸发。

问题在于：根据量子力学，信息不能被摧毁；但霍金的计算表明，黑洞蒸发后，掉入黑洞的物质信息似乎永远丢失了。

### 主要观点

1. **信息丢失**：霍金最初认为信息确实丢失了
2. **信息守恒**：大部分物理学家认为信息以某种方式保存在霍金辐射中
3. **全息原理**：信息可能储存在黑洞视界的二维表面上

### 最新进展

近年来，通过全息对偶、纠缠熵等工具，理论物理学家在解决这一悖论上取得了重大进展。黑洞信息悖论的研究正在改写我们对时空和量子力学的基本理解。`,
    tags: ['columnData.articles.art2.tags.a', 'columnData.articles.art2.tags.b', 'columnData.articles.art2.tags.c'],
    viewCount: 2800,
    likeCount: 198,
    commentCount: 35,
    createdAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'art-3',
    columnId: 'col-2',
    columnSlug: 'edu-lab',
    title: 'columnData.articles.art3.title',
    excerpt: 'columnData.articles.art3.excerpt',
    content: `## 如何设计一门引人入胜的科普课程

### 核心理念：好奇驱动

最好的科学教育不是灌输知识，而是激发好奇心。孩子们天生就是科学家——他们会观察、提问、实验。

### 五大设计原则

1. **从现象出发**：先展示有趣的现象，再解释背后的原理
2. **阶梯式难度**：每个台阶都不能太高，保持"刚好够得着"
3. **动手优先**：实验和制作比听讲有效10倍
4. **故事驱动**：将科学知识包装在故事中
5. **反馈循环**：及时的正反馈强化学习动机

### 实践案例

我在设计"光的奇妙世界"课程时，第一节课不是讲麦克斯韦方程组，而是让学生在暗室中用三棱镜分解白光，看到彩虹的瞬间，所有孩子的眼睛都亮了。`,
    tags: ['columnData.articles.art3.tags.a', 'columnData.articles.art3.tags.b', 'columnData.articles.art3.tags.c'],
    viewCount: 1800,
    likeCount: 145,
    commentCount: 22,
    createdAt: '2026-07-08T09:00:00Z',
  },
  {
    id: 'art-4',
    columnId: 'col-3',
    columnSlug: 'academic-writing',
    title: 'columnData.articles.art4.title',
    excerpt: 'columnData.articles.art4.excerpt',
    content: `## 学术论文摘要写作的黄金法则

### 摘要的五个要素

1. **背景**（1-2句）：研究领域的现状
2. **问题**（1句）：尚未解决的问题
3. **方法**（2-3句）：你做了什么
4. **结果**（3-4句）：发现了什么
5. **意义**（1-2句）：为什么重要

### 常见误区

- ❌ 包含参考文献
- ❌ 使用缩写不解释
- ❌ 过于详细的技术细节
- ❌ 夸大结果的重要性

### 模板示例

> [背景] 近年来，XXX领域取得了显著进展。然而，[问题]仍未被充分研究。
> [方法] 本文提出了一种XXX方法，通过YYY手段解决上述问题。
> [结果] 实验结果表明，该方法在ZZZ指标上提升了XX%。
> [意义] 这一发现为AAA领域的进一步研究奠定了基础。`,
    tags: ['columnData.articles.art4.tags.a', 'columnData.articles.art4.tags.b', 'columnData.articles.art4.tags.c'],
    viewCount: 4200,
    likeCount: 312,
    commentCount: 28,
    createdAt: '2026-07-01T14:00:00Z',
  },
  {
    id: 'art-5',
    columnId: 'col-4',
    columnSlug: 'algorithm-beauty',
    title: 'columnData.articles.art5.title',
    excerpt: 'columnData.articles.art5.excerpt',
    content: `## 动态规划：思维框架

### 什么是动态规划？

动态规划的核心思想是：将大问题分解为小问题，记住小问题的解，避免重复计算。

### 三个关键步骤

1. **定义状态**：dp[i] 表示什么？
2. **找转移方程**：dp[i] = f(dp[i-1], dp[i-2], ...)
3. **确定初始值**：dp[0] = ?

### 经典例题：最长递增子序列

\`\`\`python
def length_of_lis(nums):
    dp = [1] * len(nums)
    for i in range(len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)
\`\`\`

时间复杂度 O(n²)，空间复杂度 O(n)。

### 进阶思维

当你遇到一个新问题时，问自己：
1. 能分解成子问题吗？
2. 子问题之间有重叠吗？
3. 能用数组/哈希表存储子问题解吗？

如果三个问题都回答"是"，那么动态规划大概率可行。`,
    tags: ['columnData.articles.art5.tags.a', 'columnData.articles.art5.tags.b', 'columnData.articles.art5.tags.c'],
    viewCount: 5600,
    likeCount: 423,
    commentCount: 56,
    createdAt: '2026-06-28T11:00:00Z',
  },
];

export function getColumnBySlug(slug: string): MockColumn | undefined {
  return mockColumns.find((c) => c.slug === slug);
}

export function getArticlesByColumnId(columnId: string): MockColumnArticle[] {
  return mockColumnArticles.filter((a) => a.columnId === columnId);
}

export function getArticleById(id: string): MockColumnArticle | undefined {
  return mockColumnArticles.find((a) => a.id === id);
}

export function getArticleBySlug(columnSlug: string, _articleSlug: string): MockColumnArticle | undefined {
  return mockColumnArticles.find((a) => a.columnSlug === columnSlug);
}
