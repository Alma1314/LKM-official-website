import { t } from "~/lib/i18n";
import { LinkPreset, type NavBarLink } from "~/types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
  [LinkPreset.Home]: {
    name: t("nav.home"),
    url: "/blog/",
  },
  [LinkPreset.About]: {
    name: t("nav.about"),
    url: "/blog/about/",
  },
  [LinkPreset.Archive]: {
    name: t("nav.archive"),
    url: "/blog/archive/",
  },
};
