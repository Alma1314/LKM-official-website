type EventHandler = () => void;

const SHELL_EVENTS = {
  MOBILE_NAV_TOGGLE: 'mobile-nav:toggle',
  MOBILE_NAV_OPEN: 'mobile-nav:open',
  MOBILE_NAV_CLOSE: 'mobile-nav:close',
  OPEN_LOGIN_MODAL: 'open-login-modal',
} as const;

export function dispatchMobileNavToggle() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.MOBILE_NAV_TOGGLE));
}

export function dispatchOpenLoginModal() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.OPEN_LOGIN_MODAL));
}

export function onMobileNavOpen(handler: EventHandler) {
  window.addEventListener(SHELL_EVENTS.MOBILE_NAV_OPEN, handler);
  return () => window.removeEventListener(SHELL_EVENTS.MOBILE_NAV_OPEN, handler);
}

export function onMobileNavClose(handler: EventHandler) {
  window.addEventListener(SHELL_EVENTS.MOBILE_NAV_CLOSE, handler);
  return () => window.removeEventListener(SHELL_EVENTS.MOBILE_NAV_CLOSE, handler);
}

export function onMobileNavToggle(handler: EventHandler) {
  window.addEventListener(SHELL_EVENTS.MOBILE_NAV_TOGGLE, handler);
  return () => window.removeEventListener(SHELL_EVENTS.MOBILE_NAV_TOGGLE, handler);
}
