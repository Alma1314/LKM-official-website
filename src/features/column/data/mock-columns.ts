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
    id: 'col-1', authorId: 'user-qiyue-o', authorName: '七月O', authorTitle: '中国科学院国家天文台博士',
    authorBio: '引力波与黑洞物理方向，致力于天体物理科普',
    title: '宇宙探索笔记', slug: 'cosmic-notes',
    description: '记录天体物理研究前沿，分享宇宙探索的奇妙旅程。从引力波到黑洞，从暗物质到宇宙大尺度结构。',
    isVerified: true, followerCount: 1200, articleCount: 15,
  },
  {
    id: 'col-2', authorId: 'user-qiyue-hua', authorName: '七月花', authorTitle: '科学教育博士',
    authorBio: '有理想的博士，梦想每个孩子都能接触科学',
    title: '教育者的实验室', slug: 'edu-lab',
    description: '科学教育的理论与实践，课程设计、教学方法、科普写作的深度思考。',
    isVerified: true, followerCount: 890, articleCount: 8,
  },
  {
    id: 'col-3', authorId: 'user-col-3', authorName: '李教授', authorTitle: '复旦大学物理学教授',
    authorBio: '凝聚态物理研究，学术写作指导',
    title: '学术写作之道', slug: 'academic-writing',
    description: '分享论文写作技巧、学术英语表达、科研方法论等硬核内容。',
    isVerified: true, followerCount: 650, articleCount: 12,
  },
  {
    id: 'col-4', authorId: 'user-col-4', authorName: '码农老王', authorTitle: '资深算法工程师',
    authorBio: '10年算法竞赛与工程经验',
    title: '算法之美', slug: 'algorithm-beauty',
    description: '深入浅出讲解算法与数据结构，从 LeetCode 到 ACM，从工程实践到理论推导。',
    isVerified: false, followerCount: 450, articleCount: 20,
  },
];

export const mockColumnArticles: MockColumnArticle[] = [
  {
    id: 'art-1', columnId: 'col-1', columnSlug: 'cosmic-notes',
    title: '引力波天文学：聆听宇宙的"声音"',
    excerpt: '从2015年GW150914首次探测至今，引力波天文学已经成为了解宇宙的全新窗口。',
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
    tags: ['引力波', '天体物理', 'LIGO'],
    viewCount: 3400, likeCount: 256, commentCount: 42, createdAt: '2026-07-15T08:00:00Z',
  },
  {
    id: 'art-2', columnId: 'col-1', columnSlug: 'cosmic-notes',
    title: '黑洞信息悖论：物理学的最大谜题之一',
    excerpt: '霍金辐射的发现引发了一个深刻的问题：掉入黑洞的信息去哪了？',
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
    tags: ['黑洞', '霍金辐射', '量子引力'],
    viewCount: 2800, likeCount: 198, commentCount: 35, createdAt: '2026-07-10T10:00:00Z',
  },
  {
    id: 'art-3', columnId: 'col-2', columnSlug: 'edu-lab',
    title: '如何设计一门引人入胜的科普课程',
    excerpt: '基于认知科学和教学实践经验，探讨科普课程设计的核心原则。',
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
    tags: ['科学教育', '课程设计', '科普'],
    viewCount: 1800, likeCount: 145, commentCount: 22, createdAt: '2026-07-08T09:00:00Z',
  },
  {
    id: 'art-4', columnId: 'col-3', columnSlug: 'academic-writing',
    title: '学术论文摘要写作的黄金法则',
    excerpt: '摘要是论文的"广告"，好的摘要能决定论文的引用率和影响力。',
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
    tags: ['学术写作', '论文', '摘要'],
    viewCount: 4200, likeCount: 312, commentCount: 28, createdAt: '2026-07-01T14:00:00Z',
  },
  {
    id: 'art-5', columnId: 'col-4', columnSlug: 'algorithm-beauty',
    title: '动态规划：从入门到进阶的思维框架',
    excerpt: '动态规划不是一种算法，而是一种解决问题的思维方式。',
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
    tags: ['算法', '动态规划', 'Python'],
    viewCount: 5600, likeCount: 423, commentCount: 56, createdAt: '2026-06-28T11:00:00Z',
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

export function getArticleBySlug(columnSlug: string, articleSlug: string): MockColumnArticle | undefined {
  return mockColumnArticles.find((a) => a.columnSlug === columnSlug);
}
