@group(0) @binding(0) var<uniform> r: RenU;
@group(0) @binding(1) var<storage, read> terrain: array<u32>;

struct TOut {
  @builtin(position) pos: vec4f,
  @location(0) wp: vec2f,
};
/* 2D：地形条带填充。GW 列，每列 6 个顶点 = 2 个三角形。 */
@vertex
fn vmain(@builtin(vertex_index) vi: u32) -> TOut {
  let cols = u32(r.dims.x);
  let col  = (vi / 6u) % cols;
  let ci   = vi % 6u;
  let hw   = r.dims.x * r.dims.w * 0.55;
  let hh   = r.dims.y * r.dims.w * 0.55;
  let row  = f32(terrain[min(col, u32(r.dims.x) - 1u)]);
  let wy   = (r.dims.y * 0.5 - row - 0.5) * r.dims.w; // 居中世界 y
  /* 每列构建一个四边形：两个三角形、6 个顶点
     布局：[BL, BR, TL,  BR, TR, TL]
     BL = 左下 (col, bottom), BR = 右下 (col+1, bottom)
     TL = 左上 (col, surface), TR = 右上 (col+1, surface) */
  var bx0 = (f32(col) + 0.5 - r.dims.x * 0.5) * r.dims.w / hw;
  var bx1 = (f32(col + 1u) + 0.5 - r.dims.x * 0.5) * r.dims.w / hw;
  let by = -1.1;
  let ty = wy / hh;
  var px: f32; var py: f32; var wx: f32; var wy2: f32;
  switch (ci) {
    case 0u: { px = bx0; py = by; wx = f32(col); wy2 = -r.dims.y * r.dims.w; }  // BL
    case 1u: { px = bx1; py = by; wx = f32(col+1); wy2 = -r.dims.y * r.dims.w; } // BR
    case 2u: { px = bx0; py = ty; wx = f32(col); wy2 = wy; }                     // TL
    case 3u: { px = bx1; py = by; wx = f32(col+1); wy2 = -r.dims.y * r.dims.w; } // BR 重复
    case 4u: { px = bx1; py = ty; wx = f32(col+1); wy2 = wy; }                   // TR
    default: { px = bx0; py = ty; wx = f32(col); wy2 = wy; }                     // TL 重复
  }
  var o: TOut;
  o.pos = vec4f(px, py, 0.0, 1.0);
  o.wp  = vec2f(wx * r.dims.w, wy2);
  return o;
}
@fragment
fn fmain(@location(0) wp: vec2f) -> @location(0) vec4f {
  var col = vec3f(0.010, 0.011, 0.017) * 0.7;
  /* 放电：在击穿位置的点照明 */
  let sx = r.strike.x;
  let sy = r.strike.y;
  let dx = wp.x - r.dims.x * r.dims.w * 0.5 - sx;
  let dy = wp.y - sy;
  let d2 = dx * dx + dy * dy + 1e3;
  col = col + vec3f(0.62, 0.58, 0.92) * r.strike.w * 5.2e4 / (d2 + 3.0e4);
  return vec4f(col, 1.0);
}
