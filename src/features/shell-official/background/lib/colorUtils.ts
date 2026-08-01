/** 预解析的 RGBA 颜色，避免每帧正则/字符串操作 */
export interface ParsedColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const colorCache = new Map<string, ParsedColor>();
const MAX_CACHE_SIZE = 32;

/**
 * 将 rgba(r,g,b,a) 或 #rrggbb 颜色字符串一次性解析为 {r,g,b,a} 结构。
 * 结果缓存在内部 Map 中以供后续复用。
 */
export function parseColor(rgba: string): ParsedColor {
  const cached = colorCache.get(rgba);
  if (cached) return cached;

  let result: ParsedColor;

  // #hex 格式
  const hex = rgba.match(/^#([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i)?.[1];
  if (hex) {
    const expanded = hex.length <= 4 ? [...hex].map((v) => v + v).join('') : hex;
    result = {
      r: parseInt(expanded.slice(0, 2), 16),
      g: parseInt(expanded.slice(2, 4), 16),
      b: parseInt(expanded.slice(4, 6), 16),
      a: expanded.length === 8 ? parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
  } else {
    // rgba() 格式
    const functional = rgba
      .match(/^rgba?\(([^)]+)\)$/i)?.[1]
      ?.split(',')
      .map((v) => parseFloat(v.trim()));
    if (functional && functional.length >= 3) {
      result = {
        r: functional[0],
        g: functional[1],
        b: functional[2],
        a: functional.length === 4 ? functional[3] : 1,
      };
    } else {
      result = { r: 255, g: 255, b: 255, a: 1 };
    }
  }

  if (colorCache.size >= MAX_CACHE_SIZE) {
    const firstKey = colorCache.keys().next().value;
    if (firstKey !== undefined) colorCache.delete(firstKey);
  }
  colorCache.set(rgba, result);

  return result;
}

/**
 * 将 ParsedColor 转回 rgba() 字符串，可覆盖 alpha。
 */
export function colorToString(c: ParsedColor, alphaOverride?: number): string {
  const a = alphaOverride ?? c.a;
  return `rgba(${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${a})`;
}

/**
 * 快速构建 rgba 字符串，直接传数值。
 * 用于已知道 r,g,b 分量的场景（如动态 alpha 变化）。
 */
export function buildRgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r},${g},${b},${a})`;
}
