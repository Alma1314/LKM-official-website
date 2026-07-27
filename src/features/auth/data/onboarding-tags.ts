export interface TagOption {
  value: string;
  label: string;
  icon?: string;
}

export const gradeOptions: TagOption[] = [
  { value: 'junior_high', label: '初中' },
  { value: 'senior_high', label: '高中' },
  { value: 'university', label: '大学' },
  { value: 'graduate', label: '研究生' },
  { value: 'working', label: '已工作' },
];

export const majorOptions: TagOption[] = [
  { value: 'math', label: '数学', icon: 'tabler:math' },
  { value: 'physics', label: '物理学', icon: 'tabler:atom' },
  { value: 'chemistry', label: '化学', icon: 'tabler:flask' },
  { value: 'biology', label: '生命科学', icon: 'tabler:microscope' },
  { value: 'astronomy', label: '天文学', icon: 'tabler:telescope' },
  { value: 'earth_science', label: '地球科学', icon: 'tabler:globe' },
  { value: 'cs', label: '信息科学', icon: 'tabler:code' },
  { value: 'ee', label: '电子电气', icon: 'tabler:bolt' },
  { value: 'engineering', label: '工程学', icon: 'tabler:tools' },
  { value: 'medicine', label: '医学', icon: 'tabler:heartbeat' },
  { value: 'social_science', label: '社会科学', icon: 'tabler:users' },
  { value: 'literature', label: '文学', icon: 'tabler:book' },
];

export const interestOptions: TagOption[] = [
  { value: 'research', label: '科研' },
  { value: 'programming', label: '编程' },
  { value: 'reading', label: '阅读' },
  { value: 'writing', label: '写作' },
  { value: 'experiment', label: '实验' },
  { value: 'teaching', label: '教学' },
  { value: 'debate', label: '辩论' },
  { value: 'competition', label: '竞赛' },
  { value: 'astronomy_hobby', label: '天文观测' },
  { value: 'model', label: '模型制作' },
  { value: 'game', label: '游戏' },
  { value: 'music', label: '音乐' },
  { value: 'sci_fi', label: '科幻' },
  { value: 'cooking', label: '料理' },
  { value: 'chess', label: '棋牌' },
];

export interface RecommendItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  memberCount: number;
}

export const recommendCategories: RecommendItem[] = [
  {
    id: 'basic-science',
    name: '基础学科',
    description: '数学、物理、化学、生物、天文等基础科学讨论区',
    icon: 'tabler:atom-2',
    memberCount: 1200,
  },
  {
    id: 'applied-science',
    name: '应用科学',
    description: '信息科学、电子电气、工程学、医学等应用领域',
    icon: 'tabler:robot',
    memberCount: 890,
  },
  {
    id: 'language',
    name: '语言学习',
    description: '英语、俄语、德语、日语等多语言学习交流',
    icon: 'tabler:language',
    memberCount: 340,
  },
  {
    id: 'hobby-chess',
    name: '棋牌社',
    description: '象棋、围棋、五子棋、桥牌等各类棋牌交流',
    icon: 'tabler:chess',
    memberCount: 280,
  },
  {
    id: 'hobby-game',
    name: '游戏社',
    description: '主机、PC、手游玩家聚集地',
    icon: 'tabler:device-gamepad-2',
    memberCount: 420,
  },
  {
    id: 'hobby-sci-fi',
    name: '科幻文学社',
    description: '科幻创作、经典赏析、未来构想',
    icon: 'tabler:rocket',
    memberCount: 190,
  },
  {
    id: 'hobby-music',
    name: '土鳖音乐社',
    description: '乐理讨论、乐器交流、联欢晚会筹备',
    icon: 'tabler:music',
    memberCount: 310,
  },
  {
    id: 'hobby-cooking',
    name: '料理学社',
    description: '厨艺交流、美食分享、料理教学',
    icon: 'tabler:chef-hat',
    memberCount: 160,
  },
  {
    id: 'math',
    name: '数学',
    description: '数学爱好者与专业人员的交流园地',
    icon: 'tabler:math-symbols',
    memberCount: 520,
  },
  {
    id: 'physics',
    name: '物理学&天文学',
    description: '探索宇宙奥秘，讨论物理前沿',
    icon: 'tabler:telescope',
    memberCount: 480,
  },
];

export const recommendAuthors: RecommendItem[] = [
  {
    id: 'author-1',
    name: '七月O',
    description: '中国科学院国家天文台博士，引力波与黑洞物理方向',
    icon: 'tabler:user',
    memberCount: 350,
  },
  {
    id: 'author-2',
    name: '七月花',
    description: '有理想的博士，梦想每个孩子都能接触科学',
    icon: 'tabler:user',
    memberCount: 420,
  },
  {
    id: 'author-3',
    name: '七月墨染',
    description: '双非物理，卧薪尝胆三千日，大雪深埋终成金',
    icon: 'tabler:user',
    memberCount: 280,
  },
  {
    id: 'author-4',
    name: '七月郁离',
    description: '群务组组长，群务无小事，用心皆风景',
    icon: 'tabler:user',
    memberCount: 200,
  },
  {
    id: 'author-5',
    name: '七月有枝',
    description: '前活动策划组组员，且停且忘且随风',
    icon: 'tabler:user',
    memberCount: 150,
  },
];
