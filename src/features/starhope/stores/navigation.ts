import { ref, type Ref } from "vue";
import { t } from "~/lib/i18n";

export type StarHopeRoute =
  | "login"
  | "dashboard"
  | "bank"
  | "practice"
  | "exam"
  | "wrong-book"
  | "ai"
  | "reader"
  | "plugins"
  | "settings";

export interface NavItem {
  route: StarHopeRoute;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { route: "dashboard", label: t("starhope.nav.dashboard"), icon: "📊" },
  { route: "bank", label: t("starhope.nav.bank"), icon: "📚" },
  { route: "practice", label: t("starhope.nav.practice"), icon: "✏️" },
  { route: "exam", label: t("starhope.nav.exam"), icon: "📝" },
  { route: "wrong-book", label: t("starhope.nav.wrongBook"), icon: "📕" },
  { route: "ai", label: t("starhope.nav.ai"), icon: "🤖" },
  { route: "reader", label: t("starhope.nav.reader"), icon: "📖" },
  { route: "plugins", label: t("starhope.nav.plugins"), icon: "🧩" },
  { route: "settings", label: t("starhope.nav.settings"), icon: "⚙️" },
];

const currentRoute = ref<StarHopeRoute>("dashboard");

export function useNavigationStore(): {
  navItems: NavItem[];
  currentRoute: Ref<StarHopeRoute>;
  navigate: (route: StarHopeRoute) => void;
} {
  function navigate(route: StarHopeRoute): void {
    currentRoute.value = route;
  }

  return { navItems, currentRoute, navigate };
}

export const navigation = { navItems, currentRoute };
