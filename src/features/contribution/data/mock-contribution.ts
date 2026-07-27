export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: { type: string; threshold: number };
  sortOrder: number;
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
}

export interface PointLog {
  id: string;
  amount: number;
  reason: string;
  referenceType: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  displayName: string;
  points: number;
  title: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  requirementCount: number;
  currentProgress: number;
  completed: boolean;
}

export interface ExchangeItem {
  id: string;
  name: string;
  description: string;
  image?: string;
  pointsCost: number;
  stock: number;
  isVirtual: boolean;
}

export const achievements: Achievement[] = [
  { id: 'a1', name: '初来乍到', description: '完成新手引导', icon: 'tabler:star', category: 'special', requirement: { type: 'onboarding', threshold: 1 }, sortOrder: 1 },
  { id: 'a2', name: '首帖', description: '发布第一篇帖子', icon: 'tabler:pencil', category: 'posting', requirement: { type: 'post_count', threshold: 1 }, sortOrder: 2 },
  { id: 'a3', name: '十帖', description: '累计发布 10 篇帖子', icon: 'tabler:pencil-plus', category: 'posting', requirement: { type: 'post_count', threshold: 10 }, sortOrder: 3 },
  { id: 'a4', name: '精华作者', description: '帖子被加精', icon: 'tabler:star-filled', category: 'posting', requirement: { type: 'featured_count', threshold: 1 }, sortOrder: 4 },
  { id: 'a5', name: '百帖达人', description: '累计发布 100 篇帖子', icon: 'tabler:writing', category: 'posting', requirement: { type: 'post_count', threshold: 100 }, sortOrder: 5 },
  { id: 'a6', name: '助人为乐', description: '回答被采纳 5 次', icon: 'tabler:heart-handshake', category: 'helping', requirement: { type: 'accepted_answers', threshold: 5 }, sortOrder: 6 },
  { id: 'a7', name: '硬核答主', description: '回答被采纳 20 次', icon: 'tabler:brain', category: 'helping', requirement: { type: 'accepted_answers', threshold: 20 }, sortOrder: 7 },
  { id: 'a8', name: '文件达人', description: '上传文件通过审核 10 个', icon: 'tabler:file-check', category: 'files', requirement: { type: 'approved_files', threshold: 10 }, sortOrder: 8 },
  { id: 'a9', name: '连续打卡 7 天', description: '连续签到 7 天', icon: 'tabler:calendar-check', category: 'activity', requirement: { type: 'checkin_streak', threshold: 7 }, sortOrder: 9 },
  { id: 'a10', name: '连续打卡 30 天', description: '连续签到 30 天', icon: 'tabler:calendar-star', category: 'activity', requirement: { type: 'checkin_streak', threshold: 30 }, sortOrder: 10 },
  { id: 'a11', name: '项目先锋', description: '参与项目 3 个', icon: 'tabler:rocket', category: 'activity', requirement: { type: 'project_count', threshold: 3 }, sortOrder: 11 },
  { id: 'a12', name: '专栏作者', description: '发布专栏文章 5 篇', icon: 'tabler:article', category: 'special', requirement: { type: 'column_articles', threshold: 5 }, sortOrder: 12 },
];

// Current user's unlocked achievements (mock)
export const userAchievements: UserAchievement[] = [
  { achievementId: 'a1', progress: 1, unlocked: true },
  { achievementId: 'a2', progress: 1, unlocked: true },
  { achievementId: 'a3', progress: 10, unlocked: true },
  { achievementId: 'a4', progress: 1, unlocked: true },
  { achievementId: 'a5', progress: 45, unlocked: false },
  { achievementId: 'a6', progress: 5, unlocked: true },
  { achievementId: 'a7', progress: 12, unlocked: false },
  { achievementId: 'a8', progress: 7, unlocked: false },
  { achievementId: 'a9', progress: 7, unlocked: true },
  { achievementId: 'a10', progress: 7, unlocked: false },
  { achievementId: 'a11', progress: 3, unlocked: true },
  { achievementId: 'a12', progress: 5, unlocked: true },
];

export const pointLogs: PointLog[] = [
  { id: 'p1', amount: 5, reason: '每日打卡', referenceType: 'checkin', createdAt: '2026-07-27' },
  { id: 'p2', amount: 10, reason: '发帖：量子力学入门', referenceType: 'post', createdAt: '2026-07-20' },
  { id: 'p3', amount: 2, reason: '评论回复', referenceType: 'comment', createdAt: '2026-07-20' },
  { id: 'p4', amount: 20, reason: '回答被采纳', referenceType: 'answer', createdAt: '2026-07-18' },
  { id: 'p5', amount: 5, reason: '每日打卡', referenceType: 'checkin', createdAt: '2026-07-26' },
  { id: 'p6', amount: 15, reason: '文件上传通过审核', referenceType: 'file', createdAt: '2026-07-15' },
  { id: 'p7', amount: 50, reason: '竞赛获奖', referenceType: 'competition', createdAt: '2026-07-10' },
  { id: 'p8', amount: 30, reason: '完成每日任务', referenceType: 'task', createdAt: '2026-07-09' },
];

export const leaderboard: { daily: LeaderboardEntry[]; weekly: LeaderboardEntry[]; total: LeaderboardEntry[] } = {
  daily: [
    { rank: 1, username: 'qiyue-hua', displayName: '七月花', points: 85, title: '硬核答主' },
    { rank: 2, username: 'qiyue-o', displayName: '七月O', points: 60, title: '专栏作者' },
    { rank: 3, username: 'physics-lover', displayName: '物理爱好者', points: 45, title: '活跃用户' },
    { rank: 4, username: 'math-genius', displayName: '数学天才', points: 30, title: '初来乍到' },
    { rank: 5, username: 'chem-master', displayName: '化学达人', points: 25, title: '活跃用户' },
  ],
  weekly: [
    { rank: 1, username: 'qiyue-o', displayName: '七月O', points: 420, title: '专栏作者' },
    { rank: 2, username: 'qiyue-moran', displayName: '七月墨染', points: 350, title: '活跃用户' },
    { rank: 3, username: 'qiyue-hua', displayName: '七月花', points: 310, title: '硬核答主' },
    { rank: 4, username: 'physics-lover', displayName: '物理爱好者', points: 280, title: '活跃用户' },
    { rank: 5, username: 'qiyue-yuli', displayName: '七月郁离', points: 220, title: '活跃用户' },
    { rank: 6, username: 'astronomy-fan', displayName: '天文迷', points: 180, title: '初来乍到' },
    { rank: 7, username: 'code-wizard', displayName: '代码巫师', points: 150, title: '初来乍到' },
    { rank: 8, username: 'math-genius', displayName: '数学天才', points: 120, title: '初来乍到' },
  ],
  total: [
    { rank: 1, username: 'qiyue-o', displayName: '七月O', points: 12500, title: '专栏作者' },
    { rank: 2, username: 'qiyue-hua', displayName: '七月花', points: 8900, title: '硬核答主' },
    { rank: 3, username: 'qiyue-moran', displayName: '七月墨染', points: 5200, title: '活跃用户' },
    { rank: 4, username: 'physics-lover', displayName: '物理爱好者', points: 4500, title: '活跃用户' },
    { rank: 5, username: 'qiyue-yuli', displayName: '七月郁离', points: 3800, title: '活跃用户' },
    { rank: 6, username: 'astronomy-fan', displayName: '天文迷', points: 3200, title: '初来乍到' },
    { rank: 7, username: 'code-wizard', displayName: '代码巫师', points: 2800, title: '初来乍到' },
    { rank: 8, username: 'math-genius', displayName: '数学天才', points: 2400, title: '初来乍到' },
    { rank: 9, username: 'chem-master', displayName: '化学达人', points: 2100, title: '初来乍到' },
    { rank: 10, username: 'qiyue-youzhi', displayName: '七月有枝', points: 2100, title: '文件达人' },
  ],
};

export const tasks: Task[] = [
  { id: 't1', title: '每日打卡', description: '今天来签到吧', rewardPoints: 5, requirementCount: 1, currentProgress: 1, completed: true },
  { id: 't2', title: '发表 1 篇帖子', description: '分享你的知识与见解', rewardPoints: 10, requirementCount: 1, currentProgress: 0, completed: false },
  { id: 't3', title: '回答 3 个问题', description: '帮助他人解决问题', rewardPoints: 30, requirementCount: 3, currentProgress: 2, completed: false },
  { id: 't4', title: '点赞 10 次', description: '为优质内容点赞', rewardPoints: 5, requirementCount: 10, currentProgress: 7, completed: false },
  { id: 't5', title: '上传 1 个文件', description: '充实社区资源库', rewardPoints: 15, requirementCount: 1, currentProgress: 0, completed: false },
];

export const exchangeItems: ExchangeItem[] = [
  { id: 'e1', name: '理科迷定制徽章（虚拟）', description: '个人主页专属展示徽章', pointsCost: 200, stock: -1, isVirtual: true },
  { id: 'e2', name: '专属称号颜色', description: '解锁金色称号显示', pointsCost: 500, stock: -1, isVirtual: true },
  { id: 'e3', name: '专栏文章推广位', description: '在首页推荐区展示你的专栏文章 7 天', pointsCost: 1000, stock: 5, isVirtual: true },
  { id: 'e4', name: '理科迷定制笔记本', description: '限量版理科迷主题笔记本', pointsCost: 800, stock: 50, isVirtual: false },
  { id: 'e5', name: 'LKM 徽章实物', description: '理科迷金属徽章', pointsCost: 500, stock: 100, isVirtual: false },
  { id: 'e6', name: 'T恤兑换券', description: '理科迷主题T恤', pointsCost: 1500, stock: 30, isVirtual: false },
];
