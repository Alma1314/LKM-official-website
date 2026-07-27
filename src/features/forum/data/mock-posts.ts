export interface MockPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;             // Markdown 正文
  authorId: string;
  authorName: string;
  categoryId: string;
  tags: string[];
  isPinned: boolean;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  bookmarkCount: number;
  forwardCount: number;
  createdAt: string;
}

export interface MockComment {
  id: string;
  postId: string;
  authorName: string;
  content: string;
  floorNumber: number;
  parentId?: string;           // 回复某楼层
  likeCount: number;
  createdAt: string;
}

export const mockPosts: MockPost[] = [
  {
    id: 'post-1', title: '量子力学入门：从波函数到薛定谔方程',
    excerpt: '本文面向初学者，介绍量子力学中最基本的概念——波函数，以及描述其演化的薛定谔方程。',
    content: `## 量子力学入门：从波函数到薛定谔方程

量子力学是现代物理学的两大基石之一（另一个是广义相对论）。本文将带你从零开始理解量子的世界。

### 1. 为什么需要量子力学？

在 19 世纪末，经典物理学面临了三大困难：

1. **黑体辐射问题**：经典理论预测的紫外灾难与实验不符
2. **光电效应**：光的粒子性无法用波动理论解释
3. **原子稳定性**：电子绕核运动为何不掉入原子核？

### 2. 波函数

波函数 $\psi(x,t)$ 是量子力学中最核心的概念。它的物理意义由玻恩统计诠释给出：

> $|\psi(x,t)|^2$ 表示在时刻 $t$，在位置 $x$ 附近单位长度内找到粒子的概率。

波函数必须是**归一化**的：

$$
\int_{-\infty}^{\infty} |\psi(x,t)|^2 \, dx = 1
$$

### 3. 薛定谔方程

一维薛定谔方程：

$$
i\hbar \frac{\partial \psi}{\partial t} = -\frac{\hbar^2}{2m} \frac{\partial^2 \psi}{\partial x^2} + V(x)\psi
$$

其中 $\hbar = h/2\pi$ 是约化普朗克常数。

### 4. 不确定性原理

海森堡不确定性原理指出：

$$
\Delta x \cdot \Delta p \geq \frac{\hbar}{2}
$$

你不能同时精确知道粒子的位置和动量。

### 参考阅读

- Griffiths, *Introduction to Quantum Mechanics*
- Feynman, *The Feynman Lectures on Physics*, Vol. III`,
    authorId: 'author-qiyue-o', authorName: '七月O', categoryId: 'physics-astronomy',
    tags: ['量子力学', '物理学', '入门教程'],
    isPinned: true, isFeatured: true,
    viewCount: 2340, likeCount: 187, commentCount: 34, bookmarkCount: 89, forwardCount: 23,
    createdAt: '2026-07-20T08:00:00Z',
  },
  {
    id: 'post-2', title: 'Python 数据分析实战：Pandas 入门',
    excerpt: 'Pandas 是 Python 中最强大的数据分析库，本文通过实例带你快速上手。',
    content: `## Python 数据分析实战：Pandas 入门

### 安装

\`\`\`bash
pip install pandas numpy matplotlib
\`\`\`

### 基础操作

\`\`\`python
import pandas as pd
import numpy as np

# 创建 DataFrame
df = pd.DataFrame({
    '姓名': ['张三', '李四', '王五'],
    '年龄': [20, 22, 21],
    '专业': ['物理', '数学', '化学']
})

# 基本统计
print(df.describe())

# 筛选
physics_students = df[df['专业'] == '物理']

# 分组统计
df.groupby('专业')['年龄'].mean()
\`\`\`

### 数据可视化

\`\`\`python
import matplotlib.pyplot as plt

df['年龄'].plot(kind='bar')
plt.title('各学生年龄分布')
plt.show()
\`\`\`

Pandas 是数据分析入门的必备工具，建议配合 NumPy 和 Matplotlib 一起学习。`,
    authorId: 'author-qiyue-moran', authorName: '七月墨染', categoryId: 'cs',
    tags: ['Python', '数据分析', 'Pandas', '教程'],
    isPinned: false, isFeatured: false,
    viewCount: 1560, likeCount: 123, commentCount: 23, bookmarkCount: 56, forwardCount: 15,
    createdAt: '2026-07-22T14:00:00Z',
  },
  {
    id: 'post-3', title: '数学建模竞赛经验分享',
    excerpt: '分享参加全国大学生数学建模竞赛的经验与心得，包含选题策略、建模方法和论文写作技巧。',
    content: `## 数学建模竞赛经验分享

### 一、赛前准备

必备技能：
- **编程工具**：MATLAB / Python (NumPy + SciPy)
- **文献检索**：知网、Google Scholar
- **论文写作**：LaTeX 排版的必要性

推荐书目：
1. 姜启源《数学模型》
2. 司守奎《数学建模算法与应用》

### 二、比赛策略

#### 选题阶段（第一天上午）

拿到题目后前 2 小时：
1. 三人各自通读所有题目
2. 每人标记自己擅长的方向
3. 讨论确定最优题目

#### 建模阶段（第一天下午 - 第二天）

- **明确问题**：把中文题面翻译成数学语言
- **建立模型**：从简化版本开始，逐步增加复杂度
- **求解验证**：用已有数据验证模型合理性

#### 论文写作（第三天）

- 摘要最重要！评审第一印象
- 结构清晰：问题重述 → 假设 → 建模 → 求解 → 分析 → 结论
- 图表要美观，每个图表都要有说明

### 三、常见陷阱

1. 过于追求模型的复杂度而忽略可解释性
2. 数据和代码没有妥善保存
3. 队员之间沟通不畅

祝大家都能取得好成绩！`,
    authorId: 'author-qiyue-hua', authorName: '七月花', categoryId: 'math',
    tags: ['数学建模', '竞赛', '经验分享'],
    isPinned: false, isFeatured: true,
    viewCount: 3200, likeCount: 256, commentCount: 45, bookmarkCount: 112, forwardCount: 34,
    createdAt: '2026-07-18T10:00:00Z',
  },
  {
    id: 'post-4', title: '有机化学：亲核取代反应 SN1 vs SN2',
    excerpt: '比较分析亲核取代反应的两种主要机制 SN1 和 SN2，包括反应机理、影响因素和实例。',
    content: `## 亲核取代反应：SN1 vs SN2

### SN2 反应（双分子亲核取代）

**特点**：一步反应，构型翻转（瓦尔登翻转）

速率方程：$r = k[\text{RX}][\text{Nu}^-]$

影响因素：
- 底物：$\text{CH}_3\text{X} > 1^\circ > 2^\circ > 3^\circ$（空间位阻）
- 溶剂：极性非质子溶剂有利
- 离去基团：好的离去基团（$\text{I}^- > \text{Br}^- > \text{Cl}^-$）

### SN1 反应（单分子亲核取代）

**特点**：两步反应，外消旋化

速率方程：$r = k[\text{RX}]$

第一步（慢）：$\text{RX} \rightarrow \text{R}^+ + \text{X}^-$
第二步（快）：$\text{R}^+ + \text{Nu}^- \rightarrow \text{RNu}$

影响因素：
- 底物：$3^\circ > 2^\circ > 1^\circ > \text{CH}_3\text{X}$（碳正离子稳定性）
- 溶剂：极性质子溶剂有利

### 判断依据

| 条件 | SN1 | SN2 |
|------|-----|-----|
| 底物 | 3° 为主 | 1° 为主 |
| 溶剂 | 质子溶剂 | 非质子溶剂 |
| 亲核试剂强弱 | 不重要 | 强亲核 |
| 产物构型 | 外消旋 | 翻转 |

> **记忆口诀**：SN2 一步翻转，SN1 两步消旋`,
    authorId: 'author-demo2', authorName: '化学爱好者', categoryId: 'chemistry',
    tags: ['有机化学', '反应机理', 'SN1', 'SN2'],
    isPinned: false, isFeatured: false,
    viewCount: 890, likeCount: 67, commentCount: 12, bookmarkCount: 34, forwardCount: 6,
    createdAt: '2026-07-24T16:30:00Z',
  },
  {
    id: 'post-5', title: '天体物理数据集分享 — 2026年夏季版',
    excerpt: '整理了一份可用于学习和研究的天体物理公开数据集，包含星表、光谱数据和引力波事件数据。',
    content: `## 天体物理公开数据集汇总（2026年夏季版）

### 1. SDSS（斯隆数字巡天）

- **数据量**：超过 5 亿个天体的测光和光谱数据
- **获取方式**：https://www.sdss.org/
- **推荐入门**：CasJobs SQL 查询

### 2. Gaia 卫星数据

- **发布版本**：Gaia DR3（2022年发布）
- **包含内容**：约 18 亿颗恒星的精确位置、距离和运动数据
- **格式**：FITS / CSV

### 3. LIGO/Virgo 引力波数据

- **公开事件**：O1-O3 运行期间检测到的 90+ 引力波事件
- **数据获取**：GWOSC (Gravitational Wave Open Science Center)
- **教程**：Python 教程使用 PyCBC 分析数据

### 使用建议

\`\`\`python
from astropy.io import fits
import numpy as np

# 读取 FITS 文件
hdul = fits.open('spectrum.fits')
data = hdul[0].data
header = hdul[0].header
print(header)
\`\`\`

如果对某个数据集有具体问题，欢迎在评论区交流！`,
    authorId: 'author-qiyue-o', authorName: '七月O', categoryId: 'physics-astronomy',
    tags: ['天体物理', '数据集', '资源分享'],
    isPinned: true, isFeatured: true,
    viewCount: 1890, likeCount: 145, commentCount: 28, bookmarkCount: 210, forwardCount: 45,
    createdAt: '2026-07-15T09:00:00Z',
  },
  {
    id: 'post-6', title: '围棋入门：从基本规则到布局思路',
    excerpt: '围棋的基本规则、常见术语和开局布局思路，适合零基础入门。',
    content: `## 围棋入门指南

### 基本规则

1. **棋盘**：19×19 路（标准），初学者可用 9×9 或 13×13
2. **执黑先行**，交替落子于交叉点上
3. **气尽则亡**：无法逃出即为死子
4. **目的计算**：围地多者胜（中国规则）

### 常见术语

- **吃子**：提掉对方无气的棋子
- **打劫**：不能立即回提的规则
- **征子**：连续打吃的追击手段
- **虎**：保护断点的一手
- **尖**：斜向小飞的位置

### 开局思路

1. 先占角（星位、小目）
2. 再挂角或守角
3. 最后向中腹发展

> 金角银边草肚皮 — 棋盘角部价值最高，其次是边，中腹最低。

### 推荐资源

- 视频教程：B站搜索"围棋入门"
- 对弈平台：野狐围棋、腾讯围棋`,
    authorId: 'author-demo3', authorName: '棋友小明', categoryId: 'hobby-chess',
    tags: ['围棋', '入门', '棋牌'],
    isPinned: false, isFeatured: false,
    viewCount: 670, likeCount: 45, commentCount: 15, bookmarkCount: 28, forwardCount: 4,
    createdAt: '2026-07-23T11:00:00Z',
  },
  {
    id: 'post-7', title: '如何高效阅读英文论文',
    excerpt: '分享一套阅读英文学术论文的高效方法，适用于非英语母语的研究者。',
    content: `## 如何高效阅读英文论文

### 三遍阅读法

#### 第一遍：快速浏览（5-10分钟）

1. 读标题和摘要
2. 看引言最后一段（论文贡献）
3. 扫一眼结论
4. 浏览图表及其说明

**目的**：判断是否需要精读

#### 第二遍：仔细阅读（~1小时）

1. 理解核心方法
2. 分析实验设置
3. 标注关键公式
4. 记录不理解的部分

#### 第三遍：深度重构（~3-4小时）

1. 尝试重现核心推导
2. 思考论文的不足与改进方向
3. 写阅读笔记

### 工具推荐

- **翻译**：DeepL / Google 翻译（辅助理解长难句）
- **笔记**：Obsidian / Notion 建立知识图谱
- **管理**：Zotero 管理文献引用

### 词汇积累

建立自己的学术词汇表，常见词如：
- *elucidate* = 阐明
- *albeit* = 虽然
- *concomitant* = 伴随的
- *substantiate* = 证实

坚持一个月，阅读速度会有明显提升！`,
    authorId: 'author-qiyue-hua', authorName: '七月花', categoryId: 'lang-en',
    tags: ['论文阅读', '英语', '学习方法'],
    isPinned: false, isFeatured: false,
    viewCount: 2100, likeCount: 178, commentCount: 32, bookmarkCount: 145, forwardCount: 28,
    createdAt: '2026-07-25T13:00:00Z',
  },
  {
    id: 'post-8', title: '电路分析基础：基尔霍夫定律',
    excerpt: '基尔霍夫电流定律与电压定律的详细讲解，含实例分析。',
    content: `## 电路分析基础：基尔霍夫定律

### KCL（基尔霍夫电流定律）

> 流入任一节点的电流之和等于流出该节点的电流之和。

数学表达：$\sum_{k=1}^{n} i_k = 0$

### KVL（基尔霍夫电压定律）

> 沿任一闭合回路的电压代数和为零。

数学表达：$\sum_{k=1}^{n} v_k = 0$

### 实例分析

给定电路：
- $V_s = 12\text{V}$，$R_1 = 2\Omega$，$R_2 = 4\Omega$，$R_3 = 6\Omega$

步骤：
1. 标注各支路电流方向
2. 对节点 A 列 KCL：$i_1 = i_2 + i_3$
3. 对左回路列 KVL：$12 - 2i_1 - 4i_2 = 0$
4. 对右回路列 KVL：$4i_2 - 6i_3 = 0$
5. 联立解得：$i_1 = 3\text{A}, i_2 = 1.5\text{A}, i_3 = 1.5\text{A}$

### 常见错误

1. 电流方向标注混乱
2. 漏掉电压源的方向
3. 回路选择不当导致方程复杂`,
    authorId: 'author-demo4', authorName: '电气攻城狮', categoryId: 'ee',
    tags: ['电路', '基尔霍夫', '基础'],
    isPinned: false, isFeatured: false,
    viewCount: 540, likeCount: 38, commentCount: 8, bookmarkCount: 20, forwardCount: 3,
    createdAt: '2026-07-26T10:00:00Z',
  },
];

export const mockComments: MockComment[] = [
  { id: 'c1', postId: 'post-1', authorName: '物理系学生', content: '写得非常清晰！请问能再出一期关于量子谐振子的文章吗？', floorNumber: 1, likeCount: 15, createdAt: '2026-07-20T10:00:00Z' },
  { id: 'c2', postId: 'post-1', authorName: '七月O', content: '谢谢支持！量子谐振子已经在计划中了，会涵盖代数法和解析法两种求解方式。', floorNumber: 2, parentId: 'c1', likeCount: 8, createdAt: '2026-07-20T12:00:00Z' },
  { id: 'c3', postId: 'post-1', authorName: '量子萌新', content: '有个小问题：为什么波函数必须归一化？不归一化会怎样？', floorNumber: 3, likeCount: 3, createdAt: '2026-07-21T09:00:00Z' },
  { id: 'c4', postId: 'post-1', authorName: '数学物理方法', content: '因为波函数的模方表示概率密度，全空间的概率必须为 1。归一化就是确保这个概率解释成立。', floorNumber: 4, parentId: 'c3', likeCount: 10, createdAt: '2026-07-21T11:00:00Z' },
  { id: 'c5', postId: 'post-3', authorName: '竞赛新人', content: '想问一下，第一次参加数模竞赛，需要准备多长时间？', floorNumber: 1, likeCount: 5, createdAt: '2026-07-18T14:00:00Z' },
  { id: 'c6', postId: 'post-3', authorName: '七月花', content: '建议至少提前 2-3 个月开始准备。前两个月系统学习+练习，最后一个月模拟真题。', floorNumber: 2, parentId: 'c5', likeCount: 12, createdAt: '2026-07-18T16:00:00Z' },
  { id: 'c7', postId: 'post-5', authorName: '天文爱好者', content: '大赞！这些数据集太有用了，终于有人整理了一份中文说明', floorNumber: 1, likeCount: 22, createdAt: '2026-07-15T10:00:00Z' },
  { id: 'c8', postId: 'post-7', authorName: '研一菜鸟', content: '三遍阅读法真的很实用！用了两周感觉效率提升明显。', floorNumber: 1, likeCount: 18, createdAt: '2026-07-25T15:00:00Z' },
  { id: 'c9', postId: 'post-7', authorName: '留学生小明', content: '补充一个工具：Grammarly 可以帮助检查写作，特别是学术写作语气。', floorNumber: 2, likeCount: 7, createdAt: '2026-07-25T17:00:00Z' },
  { id: 'c10', postId: 'post-2', authorName: '数据分析新手', content: '写得很好！能不能再加一个数据清洗的例子？实际工作中清洗最花时间', floorNumber: 1, likeCount: 9, createdAt: '2026-07-22T16:00:00Z' },
];

export function getPostsByCategory(categoryId: string): MockPost[] {
  return mockPosts.filter((p) => p.categoryId === categoryId);
}

export function getPostById(id: string): MockPost | undefined {
  return mockPosts.find((p) => p.id === id);
}

export function getCommentsByPostId(postId: string): MockComment[] {
  return mockComments.filter((c) => c.postId === postId).sort((a, b) => a.floorNumber - b.floorNumber);
}

/** 获取置顶帖 */
export function getPinnedPosts(): MockPost[] {
  return mockPosts.filter((p) => p.isPinned);
}

/** 获取精华帖 */
export function getFeaturedPosts(): MockPost[] {
  return mockPosts.filter((p) => p.isFeatured);
}

/** 按最新排序 */
export function getLatestPosts(limit?: number): MockPost[] {
  const sorted = [...mockPosts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return limit ? sorted.slice(0, limit) : sorted;
}
