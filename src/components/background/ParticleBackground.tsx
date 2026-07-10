import { Particles } from "@tsparticles/react";
import { loadStarsPreset } from "@tsparticles/preset-stars";
import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

function getIsDark(): boolean {
  if (typeof document === "undefined") return true;
  return document.documentElement.classList.contains("dark");
}

function getIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export default function ParticleBackground() {
  const [isDark, setIsDark] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsDark(getIsDark());
    setIsMobile(getIsMobile());

    const observer = new MutationObserver(() => {
      setIsDark(getIsDark());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onResize = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Load the stars preset into tsParticles engine before rendering.
  // The @tsparticles/engine import is aliased in astro.config.ts to the
  // .pnpm store because pnpm strict mode does not hoist it to node_modules/.
  const particlesLoaded = async () => {
    const engine = await import("@tsparticles/engine");
    await loadStarsPreset(engine.tsParticles);
  };

  const options = {
    preset: "stars",
    fullScreen: false,
    particles: {
      number: {
        value: isMobile ? 40 : 70,
      },
      color: {
        value: isDark ? ["#2997ff", "#ffffff"] : ["#f59e0b", "#fbbf24"],
      },
      move: {
        enable: true,
        speed: 0.3,
        random: true,
        straight: false,
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
        onClick: {
          enable: true,
          mode: "repulse",
        },
      },
      modes: {
        grab: {
          distance: 140,
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
  };

  return (
    <Particles
      id="tsparticles"
      options={options}
      particlesLoaded={particlesLoaded}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
