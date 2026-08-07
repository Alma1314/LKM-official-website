type EventHandler = () => void;

const SHELL_EVENTS = {
  MOBILE_NAV_TOGGLE: 'mobile-nav:toggle',
  MOBILE_NAV_OPEN: 'mobile-nav:open',
  MOBILE_NAV_CLOSE: 'mobile-nav:close',
  OPEN_LOGIN_MODAL: 'open-login-modal',
  CLOSE_LOGIN_MODAL: 'close-login-modal',
  OPEN_AUTH_MODAL: 'open-auth-modal',
  CLOSE_AUTH_MODAL: 'close-auth-modal',
} as const;

export function dispatchMobileNavToggle() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.MOBILE_NAV_TOGGLE));
}

export function dispatchOpenLoginModal() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.OPEN_AUTH_MODAL, { detail: { view: 'login' } }));
}

export function dispatchOpenRegisterModal() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.OPEN_AUTH_MODAL, { detail: { view: 'register' } }));
}

export function dispatchOpenRecoveryModal() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.OPEN_AUTH_MODAL, { detail: { view: 'recovery' } }));
}

export function dispatchCloseAuthModal() {
  window.dispatchEvent(new CustomEvent(SHELL_EVENTS.CLOSE_AUTH_MODAL));
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
