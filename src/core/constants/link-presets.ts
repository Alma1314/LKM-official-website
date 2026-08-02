import I18nKey from '~/core/i18n/i18nKey';
import { i18n } from '~/core/i18n/translation';
import { LinkPreset, type NavBarLink } from '~/types/config';

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
  [LinkPreset.Home]: {
    name: i18n(I18nKey.home),
    url: '/official/article/',
  },
  [LinkPreset.About]: {
    name: i18n(I18nKey.about),
    url: '/official/article/about/',
  },
  [LinkPreset.Archive]: {
    name: i18n(I18nKey.archive),
    url: '/official/article/archive/',
  },
};
