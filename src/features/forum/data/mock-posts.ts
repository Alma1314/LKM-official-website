/**
 * 论坛板块 mock 帖子数据 — 前端 fallback 用
 *
 * 当真实后端（GraphQL）不可用或无数据时，板块详情页用本模块生成示例帖子，
 * 保证本地开发 / 演示时每个板块都能展示内容。
 *
 * 帖子标题/摘要/标签均为中文示例内容，作者为占位。计数与时间由生成函数随机产生，
 * 避免每次渲染完全相同、也更贴近真实观感。
 */
import type { GqlPost } from "~/features/forum/graphql";

/** 各分类对应的示例主题库（slug -> 候选帖子）。无匹配时回退通用主题。 */
type PostSeed = { title: string; excerpt: string; tags: string[] };

const SEED_BY_SLUG: Record<string, PostSeed[]> = {
  // ─── 基础学科 ───
  math: [
    {
      title: "如何从直觉理解「黎曼猜想」到底在证明什么",
      excerpt: "用最朴素的语言拆解素数分布的规律，以及为什么数学家为之着迷。",
      tags: ["数论", "黎曼猜想", "科普"],
    },
    {
      title: "线性代数本质：为什么矩阵乘法要这样定义",
      excerpt: "从变换的视角理解矩阵，告别死记硬背，建立几何直觉。",
      tags: ["线性代数", "矩阵", "入门"],
    },
    {
      title: "一道有趣的「调和级数」悖论",
      excerpt: "为什么无限个越来越小的数加起来的和可以无穷大？",
      tags: ["级数", "分析", "趣味数学"],
    },
  ],
  physics: [
    {
      title: "时间到底是不是真的「流逝」？",
      excerpt: "相对论视角下的时间观：时间并非绝对，而是与空间交织成一体。",
      tags: ["相对论", "时间", "物理"],
    },
    {
      title: "从双缝实验看量子世界的反直觉",
      excerpt: "一次观测如何改变了粒子的行为，量子力学的核心谜题。",
      tags: ["量子力学", "双缝实验", "科普"],
    },
    {
      title: "日常生活中的热力学第二定律",
      excerpt: "熵增定律如何解释咖啡放凉、生米煮成熟饭这些日常现象。",
      tags: ["热力学", "熵", "生活物理"],
    },
  ],
  chemistry: [
    {
      title: "元素周期表的边界在哪里？",
      excerpt: "超重元素合成的极限与理论上的「元素岛」。",
      tags: ["元素周期表", "超重元素", "化学"],
    },
    {
      title: "分子料理背后的化学原理",
      excerpt: "球化、泡沫、液氮——厨房里的化学反应大盘点。",
      tags: ["分子料理", "美食", "趣味化学"],
    },
  ],
  biology: [
    {
      title: "线粒体的能量工厂是如何运转的",
      excerpt: "三羧酸循环与氧化磷酸化，细胞能量供给的全过程拆解。",
      tags: ["细胞生物学", "线粒体", "代谢"],
    },
    {
      title: "基因编辑技术 CRISPR 到底怎么用",
      excerpt: "从原理到应用，梳理这把基因剪刀的过去与未来。",
      tags: ["基因编辑", "CRISPR", "前沿"],
    },
  ],
  // ─── 应用学科 ───
  cs: [
    {
      title: "从零理解缓存一致性：MESI 协议详解",
      excerpt: "多核 CPU 缓存如何保持同步，一文讲清硬件级缓存协议。",
      tags: ["计算机体系结构", "缓存", "并发"],
    },
    {
      title: "分布式系统为什么这么难：CAP 定理的直觉",
      excerpt: "一致性、可用性、分区容忍性三选二的真实含义与权衡。",
      tags: ["分布式", "CAP", "后端"],
    },
    {
      title: "大模型推理效率优化入门",
      excerpt: "量化、蒸馏、投机解码——让模型跑得更快更省的主流方法。",
      tags: ["大模型", "性能优化", "AI"],
    },
  ],
  ee: [
    {
      title: "开关电源与线性电源到底差在哪",
      excerpt: "效率、纹波、噪声，两种电源方案的工程取舍。",
      tags: ["电源", "硬件", "电子"],
    },
    {
      title: "信号完整性基础：阻抗究竟意味着什么",
      excerpt: "高速 PCB 设计不可回避的概念，从传输线说起。",
      tags: ["信号完整性", "PCB", "硬件"],
    },
  ],
  // ─── 语言学习 ───
  "lang-en": [
    {
      title: "英文长难句阅读的拆分技巧",
      excerpt: "从主干到从句，结构化拆解复杂英文句式的实操方法。",
      tags: ["英语", "阅读", "学习方法"],
    },
    {
      title: "如何用「影子跟读」提升口语流利度",
      excerpt: "一个被广泛验证的口语训练法，附实操步骤。",
      tags: ["英语", "口语", "训练"],
    },
  ],
  // ─── 兴趣 ───
  "hobby-chess": [
    {
      title: "开局陷阱：误入的初学者如何快速识破",
      excerpt: "常见开局陷阱的识别与应对，适合刚接触棋类的朋友。",
      tags: ["国际象棋", "开局", "棋类"],
    },
  ],
  "hobby-sci-fi": [
    {
      title: "科幻中的硬核设定：从硬科幻到软科幻的光谱",
      excerpt: "聊聊科幻作品的「硬度」分类与各自的魅力。",
      tags: ["科幻", "文学", "爱好者"],
    },
  ],
};

/** 通用回退主题（用于未单独配置的分类） */
const FALLBACK_SEEDS: PostSeed[] = [
  {
    title: "板块公告：欢迎加入我们的讨论",
    excerpt: "这里是本板块的置顶公告，欢迎新老朋友踊跃发言、参与讨论。",
    tags: ["公告", "欢迎"],
  },
  {
    title: "分享一个你最近想弄懂的问题",
    excerpt: "开放讨论帖：说说你近期正在琢磨的问题，大家一起集思广益。",
    tags: ["讨论", "求助"],
  },
  {
    title: "入门指南：新手如何快速上手本板块",
    excerpt: "一份给新成员的板块导航，介绍规则、常用话题与交流方式。",
    tags: ["入门", "指南"],
  },
  {
    title: "本周精选讨论回顾与下周预告",
    excerpt: "盘点本周热门话题，预告即将上线的新内容与活动。",
    tags: ["精选", "周报"],
  },
  {
    title: "冷知识：你可能没注意到的有趣细节",
    excerpt: "分享一些本领域里反直觉、又很有意思的小知识。",
    tags: ["冷知识", "趣味"],
  },
];

/** 常用昵称池，生成本地署名占位 */
const AUTHOR_POOL: string[] = [
  "星辰观测者",
  "化学探针",
  "量子漫步",
  "算法工程师",
  "语文课代表",
  "熵增抵抗者",
  "小小理科迷",
  "博物君",
];

/** 简单的伪随机（播种自字符串，保证同分类每次稳定） */
function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) | 0;
  }
  return h;
}

/**
 * 生成某分类下的 mock 帖子。
 * seeds 数量可从模板数多少变化；若传全部（默认），派生多个帖子以充实列表。
 */
export function generateMockPostsForCategory(
  categoryId: string,
  count: number = 6,
): GqlPost[] {
  const seeds = SEED_BY_SLUG[categoryId] ?? FALLBACK_SEEDS;
  const base = hashCode(categoryId);
  const out: GqlPost[] = [];

  for (let i = 0; i < Math.max(count, seeds.length); i++) {
    const seed = seeds[i % seeds.length];
    const r = base + i * 7919;
    const view = 200 + ((r * 37) % 8000);
    const like = Math.floor(view / (6 + ((r >> 3) % 12)));
    const comment = Math.floor(view / (20 + ((r >> 5) % 30)));
    // 相对当前时间向前偏移，i 越大越久远（保证稳定展示"时间"变化）
    const hoursAgo = i * 5 + (r % 3) * (i + 1);
    const date = new Date(Date.now() - hoursAgo * 3600 * 1000);

    out.push({
      id: -Math.abs(r), // 负 id 区分本地 mock，避免与后端真实 id 冲突
      title: seed.title,
      excerpt: seed.excerpt,
      content: `# ${seed.title}\n\n${seed.excerpt}\n\n（这是一条本地生成的示例帖子，用于板块预览体验。）`,
      categoryId,
      tags: seed.tags,
      isPinned: i === 0,
      isFeatured: i % 2 === 1 && i < 4,
      viewCount: view,
      likeCount: like,
      commentCount: comment,
      bookmarkCount: Math.floor(like / 5),
      forwardCount: Math.floor(like / 8),
      createdAt: date.toISOString(),
      author: {
        id: Math.abs((r >> 11) % 10000) + 1,
        displayName: AUTHOR_POOL[Math.abs((r >> 13) % AUTHOR_POOL.length)],
        avatar: "",
        username: `user_${Math.abs((r >> 17) % 100000)}`,
      },
    });
  }

  return out.slice(0, count);
}
