export interface AdminStat {
  label: string;
  value: number;
  change: string;
  icon: string;
}

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: 'member' | 'moderator' | 'admin';
  level: 'local' | 'normal' | 'professional';
  postCount: number;
  points: number;
  isBanned: boolean;
  createdAt: string;
}

export interface AdminPost {
  id: string;
  title: string;
  authorName: string;
  categoryName: string;
  status: 'published' | 'flagged' | 'deleted';
  flagReason?: string;
  viewCount: number;
  createdAt: string;
}

export interface AdminFile {
  id: string;
  originalName: string;
  uploaderName: string;
  size: string;
  categoryName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface AdminReport {
  id: string;
  type: 'post' | 'comment' | 'file';
  targetId: string;
  targetTitle: string;
  reporterName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export const adminStats: AdminStat[] = [
  { label: '注册用户', value: 156, change: '+12 本周', icon: 'tabler:users' },
  { label: '帖子总数', value: 42, change: '+8 本周', icon: 'tabler:article' },
  { label: '待审核文件', value: 12, change: '3 新增', icon: 'tabler:file-check' },
  { label: '待处理举报', value: 3, change: '', icon: 'tabler:flag' },
];

export const adminUsers: AdminUser[] = [
  { id: 'u1', username: 'qiyue-o', displayName: '七月O', email: 'qiyue-o@likemi.com', role: 'moderator', level: 'professional', postCount: 28, points: 12500, isBanned: false, createdAt: '2026-01-15' },
  { id: 'u2', username: 'qiyue-hua', displayName: '七月花', email: 'qiyue-hua@likemi.com', role: 'admin', level: 'professional', postCount: 35, points: 8900, isBanned: false, createdAt: '2026-01-10' },
  { id: 'u3', username: 'qiyue-moran', displayName: '七月墨染', email: 'qiyue-moran@likemi.com', role: 'member', level: 'normal', postCount: 42, points: 5200, isBanned: false, createdAt: '2026-02-20' },
  { id: 'u4', username: 'spammer001', displayName: '广告账号', email: 'spam@test.com', role: 'member', level: 'local', postCount: 5, points: 50, isBanned: true, createdAt: '2026-07-20' },
  { id: 'u5', username: 'new_user', displayName: '新用户', email: 'new@test.com', role: 'member', level: 'normal', postCount: 0, points: 0, isBanned: false, createdAt: '2026-07-27' },
];

export const adminPosts: AdminPost[] = [
  { id: 'post-1', title: '量子力学入门：从波函数到薛定谔方程', authorName: '七月O', categoryName: '物理学&天文学', status: 'published', viewCount: 2340, createdAt: '2026-07-20' },
  { id: 'post-2', title: 'Python数据分析实战', authorName: '七月墨染', categoryName: '信息科学', status: 'published', viewCount: 1560, createdAt: '2026-07-22' },
  { id: 'post-99', title: '加微信xxx日赚千元', authorName: '广告账号', categoryName: '数学', status: 'flagged', flagReason: '垃圾广告', viewCount: 45, createdAt: '2026-07-27' },
  { id: 'post-100', title: '敏感内容标题', authorName: '可疑用户', categoryName: '社会科学', status: 'flagged', flagReason: '违规内容', viewCount: 120, createdAt: '2026-07-26' },
];

export const adminFiles: AdminFile[] = [
  { id: 'file-1', originalName: '天体物理数据集（2026版）.zip', uploaderName: '七月O', size: '128 MB', categoryName: '物理学&天文学', status: 'approved', createdAt: '2026-07-15' },
  { id: 'file-7', originalName: '芯片设计入门教程.pdf', uploaderName: '芯片工程师', size: '12 MB', categoryName: '集成电路', status: 'pending', createdAt: '2026-07-27' },
  { id: 'file-8', originalName: '英语学术写作指南.pdf', uploaderName: '留学生小明', size: '4 MB', categoryName: '英语', status: 'pending', createdAt: '2026-07-26' },
  { id: 'file-9', originalName: '破解软件教程.zip', uploaderName: '可疑用户', size: '50 MB', categoryName: '信息科学', status: 'rejected', createdAt: '2026-07-25' },
];

export const adminReports: AdminReport[] = [
  { id: 'r1', type: 'post', targetId: 'post-99', targetTitle: '加微信xxx日赚千元', reporterName: '热心用户', reason: '垃圾广告', status: 'pending', createdAt: '2026-07-27' },
  { id: 'r2', type: 'comment', targetId: 'comment-99', targetTitle: '不文明评论', reporterName: '匿名', reason: '人身攻击', status: 'pending', createdAt: '2026-07-27' },
  { id: 'r3', type: 'file', targetId: 'file-100', targetTitle: '疑似侵权文件.pdf', reporterName: '版权方', reason: '侵权内容', status: 'pending', createdAt: '2026-07-26' },
];
