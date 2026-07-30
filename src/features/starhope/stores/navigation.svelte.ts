export type StarHopeRoute =
  'login' | 'dashboard' | 'bank' | 'practice' | 'exam' | 'wrong-book' | 'ai' | 'reader' | 'plugins' | 'settings';

export interface NavItem {
  route: StarHopeRoute;
  label: string;
  icon: string;
}

class NavigationStore {
  navItems: NavItem[] = [
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

  currentRoute = $state<StarHopeRoute>('dashboard');

  navigate(route: StarHopeRoute) {
    this.currentRoute = route;
  }
}

export const navigationStore = new NavigationStore();

// 向后兼容旧名称
export const navigation = navigationStore;
