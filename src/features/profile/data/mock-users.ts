export interface MockUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio: string;
  major: string;
  grade: string;
  interests: string[];
  ideals: string;
  title: string;            // 称号 key
  points: number;
  followerCount: number;
  followingCount: number;
  postCount: number;
  projectCount: number;
  columnArticleCount: number;
  hasColumnAccess: boolean;
}

export const TITLE_MAP: Record<string, { name: string; color: string }> = {
  'newbie':       { name: '初来乍到', color: '#9ca3af' },
  'active':       { name: '活跃用户', color: '#22c55e' },
  'hardcore':     { name: '硬核答主', color: '#3b82f6' },
  'file_master':  { name: '文件达人', color: '#9333ea' },
  'project_pioneer': { name: '项目先锋', color: '#f97316' },
  'columnist':    { name: '专栏作者', color: 'var(--color-primary)' },
};

export const mockUsers: MockUser[] = [
  {
    id: 'user-qiyue-o', username: 'qiyue-o', displayName: '七月O',
    bio: '仰望星空，脚踏实地',
    major: '天体物理', grade: '博士',
    interests: ['引力波', '黑洞物理', '天文观测', '科普写作'],
    ideals: '让每个人都能感受到宇宙的壮丽',
    title: 'columnist', points: 12500,
    followerCount: 350, followingCount: 42,
    postCount: 28, projectCount: 3, columnArticleCount: 15,
    hasColumnAccess: true,
  },
  {
    id: 'user-qiyue-hua', username: 'qiyue-hua', displayName: '七月花',
    bio: '一个有理想的博士',
    major: '科学教育', grade: '博士',
    interests: ['教育', '科普', '数学建模', '课程设计'],
    ideals: '每个孩子都能接触科学',
    title: 'hardcore', points: 8900,
    followerCount: 420, followingCount: 68,
    postCount: 35, projectCount: 5, columnArticleCount: 8,
    hasColumnAccess: true,
  },
  {
    id: 'user-qiyue-moran', username: 'qiyue-moran', displayName: '七月墨染',
    bio: '卧薪尝胆三千日，大雪深埋终成金',
    major: '物理学', grade: '本科',
    interests: ['Python', '数据分析', '物理学', '编程'],
    ideals: '用代码探索物理世界',
    title: 'active', points: 5200,
    followerCount: 280, followingCount: 95,
    postCount: 42, projectCount: 2, columnArticleCount: 0,
    hasColumnAccess: false,
  },
  {
    id: 'user-qiyue-yuli', username: 'qiyue-yuli', displayName: '七月郁离',
    bio: '群务无小事，用心皆风景',
    major: '管理学', grade: '硕士',
    interests: ['社区运营', '活动策划', '心理学'],
    ideals: '打造最好的科技爱好者社区',
    title: 'active', points: 3800,
    followerCount: 200, followingCount: 156,
    postCount: 18, projectCount: 1, columnArticleCount: 0,
    hasColumnAccess: false,
  },
  {
    id: 'user-qiyue-youzhi', username: 'qiyue-youzhi', displayName: '七月有枝',
    bio: '且停且忘且随风，且行且看且从容',
    major: '文学', grade: '本科',
    interests: ['文学创作', '科幻', '音乐', '活动策划'],
    ideals: '用文字记录科学的诗意',
    title: 'file_master', points: 2100,
    followerCount: 150, followingCount: 89,
    postCount: 12, projectCount: 0, columnArticleCount: 0,
    hasColumnAccess: false,
  },
];

export function getUserByUsername(username: string): MockUser | undefined {
  return mockUsers.find((u) => u.username === username);
}

export function getUserById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}
