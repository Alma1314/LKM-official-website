/**
 * BlogLayout 页面初始化：主题、色相、滚动条、Banner、滚动/窗口事件
 */

import 'overlayscrollbars/overlayscrollbars.css';
import { OverlayScrollbars } from 'overlayscrollbars';
import { getHue, getStoredTheme, setHue, setTheme } from '~/core/utils/setting-utils';
import {
  BANNER_HEIGHT,
  BANNER_HEIGHT_EXTEND,
  BANNER_HEIGHT_HOME,
  MAIN_PANEL_OVERLAPS_BANNER_HEIGHT,
} from '~/core/constants/constants';
import { siteConfig } from '~/core/config';

/* ---------- 点击外部关闭面板 ---------- */
function setClickOutsideToClose(panel: string, ignores: string[]) {
  document.addEventListener('click', (event) => {
    const panelDom = document.getElementById(panel);
    const tDom = event.target;
    if (!(tDom instanceof Node)) return;
    for (const ig of ignores) {
      const ie = document.getElementById(ig);
      if (ie === tDom || ie?.contains(tDom)) {
        return;
      }
    }
    panelDom?.classList.add('float-panel-closed');
  });
}
setClickOutsideToClose('display-setting', ['display-setting', 'display-settings-switch']);
setClickOutsideToClose('search-panel', ['search-panel', 'search-bar', 'search-switch']);

/* ---------- 主题与色相 ---------- */
function loadTheme() {
  const theme = getStoredTheme();
  setTheme(theme);
}

function loadHue() {
  setHue(getHue());
}

/* ---------- 自定义滚动条 ---------- */
export function initCustomScrollbar() {
  const bodyElement = document.querySelector('body');
  if (!bodyElement) return;
  OverlayScrollbars(
    {
      target: bodyElement,
      cancel: {
        nativeScrollbarsOverlaid: true,
      },
    },
    {
      scrollbars: {
        theme: 'scrollbar-base scrollbar-auto py-1',
        autoHide: 'move',
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    }
  );

  const katexElements = document.querySelectorAll('.katex-display') as NodeListOf<HTMLElement>;

  const processKatexElement = (element: HTMLElement) => {
    if (!element.parentNode) return;
    if (element.hasAttribute('data-scrollbar-initialized')) return;

    const container = document.createElement('div');
    container.className = 'katex-display-container';
    container.setAttribute('aria-label', 'scrollable container for formulas');

    element.parentNode.insertBefore(container, element);
    container.appendChild(element);

    OverlayScrollbars(container, {
      scrollbars: {
        theme: 'scrollbar-base scrollbar-auto',
        autoHide: 'leave',
        autoHideDelay: 500,
        autoHideSuspend: false,
      },
    });

    element.setAttribute('data-scrollbar-initialized', 'true');
  };

  const katexObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        processKatexElement(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
  });

  katexElements.forEach((element) => {
    katexObserver.observe(element);
  });
}

/* ---------- Banner 显示 ---------- */
export function showBanner() {
  if (!siteConfig.banner.enable) return;
  const banner = document.getElementById('banner');
  if (!banner) {
    console.error('Banner element not found');
    return;
  }
  banner.classList.remove('opacity-0', 'scale-105');
}

/* ---------- 滚动处理 ---------- */
const backToTopBtn = document.getElementById('back-to-top-btn');
const toc = document.getElementById('toc-wrapper');
const navbar = document.getElementById('navbar-wrapper');
const bannerEnabled = !!document.getElementById('banner-wrapper');

function handleScroll() {
  const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);

  if (backToTopBtn) {
    if (document.body.scrollTop > bannerHeight || document.documentElement.scrollTop > bannerHeight) {
      backToTopBtn.classList.remove('hide');
    } else {
      backToTopBtn.classList.add('hide');
    }
  }

  if (bannerEnabled && toc) {
    if (document.body.scrollTop > bannerHeight || document.documentElement.scrollTop > bannerHeight) {
      toc.classList.remove('toc-hide');
    } else {
      toc.classList.add('toc-hide');
    }
  }

  if (!bannerEnabled) return;
  if (navbar) {
    const NAVBAR_HEIGHT = 72;
    const MAIN_PANEL_EXCESS_HEIGHT = MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16;
    let bannerH = BANNER_HEIGHT;
    if (document.body.classList.contains('lg:is-home') && window.innerWidth >= 1024) {
      bannerH = BANNER_HEIGHT_HOME;
    }
    const threshold = window.innerHeight * (bannerH / 100) - NAVBAR_HEIGHT - MAIN_PANEL_EXCESS_HEIGHT - 16;
    if (document.body.scrollTop >= threshold || document.documentElement.scrollTop >= threshold) {
      navbar.classList.add('navbar-hidden');
    } else {
      navbar.classList.remove('navbar-hidden');
    }
  }
}
window.addEventListener('scroll', handleScroll, { passive: true });

function handleResize() {
  let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
  offset = offset - (offset % 4);
  document.documentElement.style.setProperty('--banner-height-extend', `${offset}px`);
}
window.addEventListener('resize', handleResize);

/* ---------- 初始化 ---------- */
function init() {
  loadTheme();
  loadHue();
  initCustomScrollbar();
  showBanner();

  // 设置初始 content-delay 用于入场动画
  document.documentElement.style.setProperty('--content-delay', '300ms');
}

if ('requestIdleCallback' in window) {
  requestIdleCallback(init, { timeout: 2000 });
} else {
  setTimeout(init, 1);
}
