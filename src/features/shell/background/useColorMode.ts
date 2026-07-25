import { useEffect, useState } from 'react';

const isDark = () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

export function useColorMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>(() => (isDark() ? 'dark' : 'light'));

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setMode(isDark() ? 'dark' : 'light');
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return mode;
}
