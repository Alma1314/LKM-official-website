// 全局常量配置：分类、心情标签、贴纸、信纸模板、治愈文案、敏感词

// ---------- 类型定义 ----------

export interface CategoryInfo {
  key: string;
  label: string;
  emoji: string;
  color: string;
}

export interface TagInfo {
  key: string;
  label: string;
  emoji: string;
  desc?: string;
  color: string;
}

export interface PaperInfo {
  key: string;
  label: string;
  gradient: string;
}

// 信件分类
export const CATEGORIES: CategoryInfo[] = [
  { key: 'confess', label: '表白', emoji: '💌', color: '#ff9aa2' },
  { key: 'heart', label: '心事', emoji: '🌧️', color: '#a0c4ff' },
  { key: 'roast', label: '吐槽', emoji: '🔥', color: '#ffd6a5' },
  { key: 'help', label: '求助', emoji: '🆘', color: '#bdb2ff' },
  { key: 'campus', label: '校园', emoji: '🎓', color: '#9bf6ff' },
  { key: 'work', label: '职场', emoji: '💼', color: '#caffbf' },
  { key: 'crush', label: '暗恋', emoji: '🌙', color: '#ffc6ff' },
  { key: 'heal', label: '治愈', emoji: '🌿', color: '#b9fbc0' },
  { key: 'fun', label: '趣事', emoji: '🎉', color: '#ffadad' },
  { key: 'insight', label: '感悟', emoji: '💡', color: '#fdffb6' },
];

export function getCategory(key: string): CategoryInfo {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];
}

// 内容标签（可多选，区别于“心情”，用于人群/主题归类，如学术）
export const TAGS: TagInfo[] = [
  { key: 'academic', label: '学术', emoji: '📚', desc: '科研 / 硕博 / 研究生烦恼', color: '#8e7cff' },
  { key: 'campus', label: '校园', emoji: '🏫', color: '#4fc3f7' },
  { key: 'work', label: '职场', emoji: '💼', color: '#81c784' },
  { key: 'growth', label: '成长', emoji: '🌱', color: '#ffb74d' },
  { key: 'love', label: '情感', emoji: '💗', color: '#f06292' },
  { key: 'family', label: '家庭', emoji: '🏠', color: '#9575cd' },
  { key: 'life', label: '生活', emoji: '🌈', color: '#4db6ac' },
];

export function getTag(key: string): TagInfo | undefined {
  return TAGS.find((t) => t.key === key);
}

// 保密等级
export const PRIVACY = [
  { key: 'public', label: '公开可见', desc: '展示在树洞广场' },
  { key: 'self', label: '仅自己可见', desc: '只保存在本地' },
  { key: 'random', label: '随机匿名推送', desc: '随机发给陌生人' },
];

// 心情标签
export const MOODS = [
  '开心',
  '难过',
  'emo',
  '平静',
  '焦虑',
  '期待',
  '释怀',
  '孤独',
  '心动',
  '疲惫',
  '勇敢',
  '迷茫',
  '感恩',
  '委屈',
  '治愈',
  '懵圈',
];

// 背景贴纸（emoji）
export const STICKERS = [
  '🌸',
  '⭐',
  '🌈',
  '🍃',
  '🌙',
  '☁️',
  '🐱',
  '💭',
  '🕯️',
  '🍂',
  '🫧',
  '🌟',
  '🦋',
  '🍰',
  '🌊',
  '✨',
];

// 信纸模板（渐变背景 + 名称）
export const PAPERS: PaperInfo[] = [
  { key: 'paper', label: '信纸', gradient: 'linear-gradient(135deg,#fff8f0,#ffe9d6)' },
  { key: 'starry', label: '星空', gradient: 'radial-gradient(circle at 30% 20%, #2b2f77, #0d0b2b)' },
  { key: 'minimal', label: '简约', gradient: 'linear-gradient(135deg,#fdfdfd,#eef2f5)' },
  { key: 'art', label: '文艺', gradient: 'linear-gradient(135deg,#f6e7d8,#e9d5ec)' },
  { key: 'campus', label: '校园', gradient: 'linear-gradient(135deg,#e8f5e9,#dbeafe)' },
];
export function getPaper(key: string): PaperInfo {
  return PAPERS.find((p) => p.key === key) || PAPERS[0];
}

// 字体大小三档
export const FONT_SCALES = {
  small: '0.9',
  normal: '1',
  large: '1.15',
};

// 每日治愈文案
export const DAILY_QUOTES = [
  '你不需要很厉害才能开始，但你需要开始才能很厉害。',
  '今天的不开心就到此为止吧，明天依旧光芒万丈。',
  '万物皆有裂痕，那是光照进来的地方。',
  '慢慢来，所有的好戏都在烟火里，也在平淡里。',
  '你是独一无二的，像夜空里最安静的那颗星。',
  '允许自己偶尔枯萎，是为了更好地重新生长。',
  '世界很吵，但你的心可以很静。',
  '把心事说给风听，风会替你保守秘密。',
  '温柔的人，终会被世界温柔以待。',
  '不被定义，才自由。',
  '请相信，冬天走了，春天一定会来。',
  '你今天的努力，是幸运的伏笔。',
  '月亮本无光，借了太阳的光，你亦可。',
  '不要急着要答案，时间会替你慢慢揭晓。',
  '生活明朗，万物可爱，人间值得。',
];
export function randomQuote(): string {
  return DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
}

// 简易敏感词（演示用，真实场景需后端词库）
export const SENSITIVE_WORDS = ['傻逼', '废物', '去死', '政治', '赌博', '诈骗', '代开发票', '加微信', '加我vx', '操你'];

// 表情面板
export const EMOJIS = [
  '😀',
  '😁',
  '😂',
  '🤣',
  '😊',
  '😍',
  '😘',
  '😎',
  '🤔',
  '😴',
  '😭',
  '😡',
  '👍',
  '👏',
  '🙏',
  '💪',
  '❤️',
  '🧡',
  '💛',
  '💚',
  '💙',
  '💜',
  '🖤',
  '💔',
  '✨',
  '🌟',
  '⭐',
  '🌈',
  '🌸',
  '🌹',
  '🍀',
  '🔥',
  '🍃',
  '🌿',
  '🌊',
  '☁️',
  '🌙',
  '⚡',
  '🎉',
  '🎈',
  '🍰',
  '🍓',
  '🐱',
  '🐶',
  '🦋',
  '🐬',
  '🌻',
  '💡',
];
