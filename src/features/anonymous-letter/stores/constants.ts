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
  { key: 'confess', label: 'treeholeData.categories.confess', emoji: '💌', color: '#ff9aa2' },
  { key: 'heart', label: 'treeholeData.categories.heart', emoji: '🌧️', color: '#a0c4ff' },
  { key: 'roast', label: 'treeholeData.categories.roast', emoji: '🔥', color: '#ffd6a5' },
  { key: 'help', label: 'treeholeData.categories.help', emoji: '🆘', color: '#bdb2ff' },
  { key: 'campus', label: 'treeholeData.categories.campus', emoji: '🎓', color: '#9bf6ff' },
  { key: 'work', label: 'treeholeData.categories.work', emoji: '💼', color: '#caffbf' },
  { key: 'crush', label: 'treeholeData.categories.crush', emoji: '🌙', color: '#ffc6ff' },
  { key: 'heal', label: 'treeholeData.categories.heal', emoji: '🌿', color: '#b9fbc0' },
  { key: 'fun', label: 'treeholeData.categories.fun', emoji: '🎉', color: '#ffadad' },
  { key: 'insight', label: 'treeholeData.categories.insight', emoji: '💡', color: '#fdffb6' },
];

export function getCategory(key: string): CategoryInfo {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];
}

// 内容标签（可多选，区别于“心情”，用于人群/主题归类，如学术）
export const TAGS: TagInfo[] = [
  {
    key: 'academic',
    label: 'treeholeData.tags.academic.label',
    emoji: '📚',
    desc: 'treeholeData.tags.academic.desc',
    color: '#8e7cff',
  },
  { key: 'campus', label: 'treeholeData.tags.campus.label', emoji: '🏫', color: '#4fc3f7' },
  { key: 'work', label: 'treeholeData.tags.work.label', emoji: '💼', color: '#81c784' },
  { key: 'growth', label: 'treeholeData.tags.growth.label', emoji: '🌱', color: '#ffb74d' },
  { key: 'love', label: 'treeholeData.tags.love.label', emoji: '💗', color: '#f06292' },
  { key: 'family', label: 'treeholeData.tags.family.label', emoji: '🏠', color: '#9575cd' },
  { key: 'life', label: 'treeholeData.tags.life.label', emoji: '🌈', color: '#4db6ac' },
];

export function getTag(key: string): TagInfo | undefined {
  return TAGS.find((t) => t.key === key);
}

// 保密等级
export const PRIVACY = [
  { key: 'public', label: 'treeholeData.privacy.public.label', desc: 'treeholeData.privacy.public.desc' },
  { key: 'self', label: 'treeholeData.privacy.self.label', desc: 'treeholeData.privacy.self.desc' },
  { key: 'random', label: 'treeholeData.privacy.random.label', desc: 'treeholeData.privacy.random.desc' },
];

// 心情标签（值为存储/枚举比较值，展示时经 moodKey() 映射到 i18n key）
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

// 心情枚举值 → i18n key（仅用于展示，不改动存储值）
export const MOOD_KEYS: Record<string, string> = {
  开心: 'treeholeData.moods.happy',
  难过: 'treeholeData.moods.sad',
  emo: 'treeholeData.moods.emo',
  平静: 'treeholeData.moods.calm',
  焦虑: 'treeholeData.moods.anxious',
  期待: 'treeholeData.moods.expecting',
  释怀: 'treeholeData.moods.relieved',
  孤独: 'treeholeData.moods.lonely',
  心动: 'treeholeData.moods.crush',
  疲惫: 'treeholeData.moods.tired',
  勇敢: 'treeholeData.moods.brave',
  迷茫: 'treeholeData.moods.lost',
  感恩: 'treeholeData.moods.grateful',
  委屈: 'treeholeData.moods.wronged',
  治愈: 'treeholeData.moods.healed',
  懵圈: 'treeholeData.moods.confused',
};

export function moodKey(mood: string): string {
  return MOOD_KEYS[mood] ?? mood;
}

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
  { key: 'paper', label: 'treeholeData.papers.paper', gradient: 'linear-gradient(135deg,#fff8f0,#ffe9d6)' },
  {
    key: 'starry',
    label: 'treeholeData.papers.starry',
    gradient: 'radial-gradient(circle at 30% 20%, #2b2f77, #0d0b2b)',
  },
  { key: 'minimal', label: 'treeholeData.papers.minimal', gradient: 'linear-gradient(135deg,#fdfdfd,#eef2f5)' },
  { key: 'art', label: 'treeholeData.papers.art', gradient: 'linear-gradient(135deg,#f6e7d8,#e9d5ec)' },
  { key: 'campus', label: 'treeholeData.papers.campus', gradient: 'linear-gradient(135deg,#e8f5e9,#dbeafe)' },
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

// 每日治愈文案（i18n key，展示时经 t() 渲染）
export const DAILY_QUOTES = [
  'treeholeData.quotes.q1',
  'treeholeData.quotes.q2',
  'treeholeData.quotes.q3',
  'treeholeData.quotes.q4',
  'treeholeData.quotes.q5',
  'treeholeData.quotes.q6',
  'treeholeData.quotes.q7',
  'treeholeData.quotes.q8',
  'treeholeData.quotes.q9',
  'treeholeData.quotes.q10',
  'treeholeData.quotes.q11',
  'treeholeData.quotes.q12',
  'treeholeData.quotes.q13',
  'treeholeData.quotes.q14',
  'treeholeData.quotes.q15',
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
