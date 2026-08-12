/**
 * Astro 原生 View Transitions 生命周期事件处理
 * 替代原有的 @swup/astro hooks
 *
 * 处理：
 * - Banner class 即时切换（link:click / visit:start → astro:before-swap）
 * - 内容延迟重置
 * - 页面高度扩展（防止过渡期间滚动跳跃）
 * - TOC 隐藏/显示
 */

import { BANNER_HEIGHT, BANNER_HEIGHT_EXTEND } from '~/lib/constants/constants';
import { pathsEqual, url } from '~/lib/utils/url-utils';

const bannerEnabled = !!document.getElementById('banner-wrapper');

function updateBannerClass(pathname: string): void {
  const body = document.body;
  if (pathsEqual(pathname, url('/'))) {
    body.classList.add('lg:is-home');
  } else {
    body.classList.remove('lg:is-home');
  }
}

function resetContentDelay(): void {
  document.documentElement.style.setProperty('--content-delay', '0ms');
}

function handleNavbarOnNavigation(): void {
  if (!bannerEnabled) return;
  const threshold = window.innerHeight * (BANNER_HEIGHT / 100) - 72 - 16;
  const navbar = document.getElementById('navbar-wrapper');
  if (!navbar || !document.body.classList.contains('lg:is-home')) return;
  if (document.body.scrollTop >= threshold || document.documentElement.scrollTop >= threshold) {
    navbar.classList.add('navbar-hidden');
  }
}

// --- Show/hide page-height-extend ---
function showPageHeightExtend(): void {
  const heightExtend = document.getElementById('page-height-extend');
  if (heightExtend) heightExtend.classList.remove('hidden');
}

function hidePageHeightExtend(): void {
  setTimeout(() => {
    const heightExtend = document.getElementById('page-height-extend');
    if (heightExtend) heightExtend.classList.add('hidden');
  }, 200);
}

// --- TOC visibility during transition ---
function hideTOCBeforeTransition(): void {
  const toc = document.getElementById('toc-wrapper');
  if (toc) toc.classList.add('toc-not-ready');
}

function showTOCAfterTransition(): void {
  setTimeout(() => {
    const toc = document.getElementById('toc-wrapper');
    if (toc) toc.classList.remove('toc-not-ready');
  }, 200);
}

// --- Astro View Transitions lifecycle ---

document.addEventListener('astro:before-swap', () => {
  updateBannerClass(window.location.pathname);
  resetContentDelay();
  handleNavbarOnNavigation();
  showPageHeightExtend();
  hideTOCBeforeTransition();
});

document.addEventListener('astro:after-swap', () => {
  hidePageHeightExtend();
  showTOCAfterTransition();
});

// Resize handler for banner height (non-transition specific)
function handleResize(): void {
  let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
  offset = offset - (offset % 4);
  document.documentElement.style.setProperty('--banner-height-extend', `${offset}px`);
}
window.addEventListener('resize', handleResize);
