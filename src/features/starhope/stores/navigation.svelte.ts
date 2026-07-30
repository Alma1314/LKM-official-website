export type StarHopeRoute =
  'login' | 'dashboard' | 'bank' | 'practice' | 'exam' | 'wrong-book' | 'ai' | 'reader' | 'plugins' | 'settings';

export interface NavItem {
  route: StarHopeRoute;
  label: string;
  icon: string;
}

export const navItems: NavItem[] = [
  { route: 'dashboard', label: '学习概览', icon: '📊' },
  { route: 'bank', label: '题库', icon: '📚' },
  { route: 'practice', label: '练习', icon: '✏️' },
  { route: 'exam', label: '考试', icon: '📝' },
  { route: 'wrong-book', label: '错题本', icon: '📕' },
  { route: 'ai', label: 'AI 助手', icon: '🤖' },
  { route: 'reader', label: '阅读器', icon: '📖' },
  { route: 'plugins', label: '插件', icon: '🧩' },
  { route: 'settings', label: '设置', icon: '⚙️' },
];

let _currentRoute = $state<StarHopeRoute>('dashboard');

export const navigation = {
  get current(): StarHopeRoute {
    return _currentRoute;
  },
  navigate(route: StarHopeRoute) {
    _currentRoute = route;
  },
};
