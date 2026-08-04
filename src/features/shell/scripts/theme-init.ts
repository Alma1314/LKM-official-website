/**
 * Theme initialization script (extracted from BasicScripts.astro)
 *
 * NOTE: This script runs is:inline in BasicScripts.astro for pre-paint theme application.
 * The inline version is the canonical source. This file serves as documentation
 * and can be used by non-inline consumers.
 */

export function applyTheme(defaultTheme: string) {
  const stored = localStorage.getItem('theme');
  const theme = stored || defaultTheme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

export function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
