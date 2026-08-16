import { useState, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
import { t } from "~/lib/i18n";

export default function FullscreenButton(): ReactElement {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (isFullscreen) {
      document.exitFullscreen?.();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handler = (): void => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return (
    <button
      type="button"
      className="rte-fullscreen-btn"
      title={
        isFullscreen ? t("editor.exitFullscreen") : t("editor.enterFullscreen")
      }
      onClick={toggle}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isFullscreen ? (
          <>
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </>
        ) : (
          <>
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </>
        )}
      </svg>
    </button>
  );
}
