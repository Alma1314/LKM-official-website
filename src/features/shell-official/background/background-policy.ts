export type BackgroundMode = 'static' | 'light' | 'heavy';

export interface DeviceCapabilities {
  reducedMotion: boolean;
  viewportWidth: number;
  deviceMemory?: number; // GB, via navigator.deviceMemory
  hardwareConcurrency?: number;
}

const STATIC_WIDTH_THRESHOLD = 768;
const LIGHT_MEMORY_THRESHOLD = 4;
const LIGHT_CORES_THRESHOLD = 4;

/**
 * 根据设备能力选择背景模式。
 * - reduced motion 或小屏 → 'static'（不渲染 canvas 背景）
 * - 低内存或低核数 → 'light'（仅简单背景）
 * - 其余情况允许用户选择 → 'heavy'
 */
export function chooseBackgroundMode(caps: DeviceCapabilities): BackgroundMode {
  if (caps.reducedMotion || caps.viewportWidth < STATIC_WIDTH_THRESHOLD) {
    return 'static';
  }
  if (
    (caps.deviceMemory !== undefined && caps.deviceMemory < LIGHT_MEMORY_THRESHOLD) ||
    (caps.hardwareConcurrency !== undefined && caps.hardwareConcurrency < LIGHT_CORES_THRESHOLD)
  ) {
    return 'light';
  }
  return 'heavy';
}

export function detectCapabilities(): DeviceCapabilities {
  return {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    viewportWidth: window.innerWidth,
    deviceMemory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
  };
}
