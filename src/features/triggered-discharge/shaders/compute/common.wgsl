struct SimU {
  gw: u32, gh: u32, gd: u32, seed: u32,
  seedX: u32, seedZ: u32, frame: u32, upOn: u32,
  bs: f32, eta: f32, time: f32, pad1: f32,
  forkIdx: u32, regrow: u32, pad2: u32, pad3: u32,
};
/* 2D 格元索引：y 优先，无 z */
fn cidx(x: u32, y: u32, gw: u32) -> u32 {
  return y * gw + x;
}
fn hashu(x0: u32) -> u32 {
  var h = x0;
  h = h ^ (h >> 16u); h = h * 0x7feb352du;
  h = h ^ (h >> 15u); h = h * 0x846ca68bu;
  h = h ^ (h >> 16u);
  return h;
}
/* 保序 float -> uint（处理符号位） */
fn ordf(f: f32) -> u32 {
  let b = bitcast<u32>(f);
  if ((b & 0x80000000u) == 0u) { return b | 0x80000000u; }
  return ~b;
}
/* 值噪声山脊 —— 2D 中的一维地形（仅 x） */
fn sh21(p: f32) -> f32 {
  var q = fract(p * 456.21);
  q = q + dot(vec2f(q, 0.0), vec2f(q + 33.33, 0.0));
  return fract(q);
}
fn svnoise(p: f32) -> f32 {
  let i = floor(p); let f = fract(p);
  let w = f * f * (3.0 - 2.0 * f);
  let a = sh21(i);          let b = sh21(i + 1.0);
  return mix(a, b, w);
}
fn sfbm(p0: f32) -> f32 {
  var p = p0; var a = 0.5; var v = 0.0;
  for (var k = 0; k < 5; k = k + 1) {
    v = v + a * svnoise(p);
    p = p * 2.03 + 17.1;
    a = a * 0.5;
  }
  return v;
}
/* 属于地形电极的首个晶格行（y 向下增长） */
fn terrainRow(x: u32, gw: u32, gh: u32, bs: f32) -> u32 {
  let xn = (f32(x) + 0.5) / f32(gw);
  let hy = 0.905 + sfbm(xn * 6.0 + bs * 31.0) * 0.055;
  var row = min(u32(hy * f32(gh)), gh - 1u);
  let td = abs(xn - 0.31) * f32(gw);
  if (td < 2.2) {
    let boost = u32(f32(gh) * 0.080 * clamp((2.2 - td) / 1.3, 0.0, 1.0));
    row = row - min(boost, row - 2u);
  }
  return row;
}
