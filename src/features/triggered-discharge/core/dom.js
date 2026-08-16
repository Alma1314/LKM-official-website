/* 几个 DOM 句柄，供其他模块使用 */

export const $ = (id) => document.getElementById(`td-${id}`);
export const canvas = $("gpu");
export const prefersStill = matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
