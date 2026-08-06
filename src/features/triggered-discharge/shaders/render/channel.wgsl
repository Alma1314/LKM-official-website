struct List { count: u32, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> r: RenU;
@group(0) @binding(1) var<storage, read> list: List;
@group(0) @binding(2) var<storage, read> addedT: array<f32>;
@group(0) @binding(3) var<storage, read> pathPos: array<f32>;
@group(0) @binding(4) var<storage, read> parent: array<u32>;
@group(0) @binding(5) var<storage, read> flags: array<u32>;
/* 类似 Horton 的缩放：段强随其馈送的电荷（后代计数）次线性增长，对主干进行钳制 */
fn feedFactor(i: u32) -> f32 {
  return min(pow(f32(1u + (flags[i] >> 4u)), 0.30), 8.0);
}

fn cellLum(i: u32) -> f32 {
  let age = r.misc0.x - addedT[i];
  let ff = feedFactor(i);
  let flick = 0.65 + 0.70 * h21(vec2f(f32(i % 2048u), floor(r.misc0.x * 24.0)));
  var v = r.misc0.y * (0.30 * ff + 6.0 * flick * exp(-age * 5.5));
  let pp = pathPos[i];
  let sType = r.misc2.x;
  if (sType == 1.0) {                     /* ---- 回击 ---- */
    if (pp >= 0.0) {
      let z  = pp * r.misc2.z;            // 地面以上的真实弧长
      let iz = baseCurrent(r, r.misc2.y - z / V_RS) * exp(-z / LAMBDA);
      v = v + lumOfCurrent(iz);
    } else if ((flags[i] & 1u) == 1u && r.misc0.z > 0.5) {
      v = v + (0.045 + 0.036 * ff) * lumOfCurrent(baseCurrent(r, r.misc2.y));
    } else if ((flags[i] & 4u) == 4u) {
      v = v + 0.05 * lumOfCurrent(baseCurrent(r, r.misc2.y));
    }
  } else if (sType == 2.0 && pp >= 0.0) { /* ---- 箭型先导 ---- */
    v = v + select(0.0, 4.5, pp >= r.misc2.w);
    v = v + 30.0 * exp(-abs(pp - r.misc2.w) * 26.0);
  } else if (sType == 3.0 && pp >= 0.0) { /* ---- 持续电流 ---- */
    v = v + r.misc2.w;
  } else if (sType == 4.0 && pp <= -2.0) {
    let t = -pp - 2.0;
    let m = floor(t);
    if (m == r.misc2.w) {
      let frac  = (t - m) / 0.92;
      let front = r.misc2.y;
      v = v + 24.0 * exp(-abs(frac - front) * 16.0);
      v = v + select(0.0, 2.2, frac > front);
    }
  }
  return v;
}

/* 2D 格元世界坐标，居中 */
fn cellWorld(idx: u32) -> vec2f {
  let x = idx % u32(r.dims.x);
  let y = (idx / u32(r.dims.x)) % u32(r.dims.y);
  return vec2f((f32(x) + 0.5 - r.dims.x * 0.5) * r.dims.w,
               (r.dims.y * 0.5 - f32(y) - 0.5) * r.dims.w);
}

/* 将 2D 世界点映射到 NDC */
fn toNDC(wp: vec2f) -> vec2f {
  /* 带内边距的域半边长 */
  let hw = r.dims.x * r.dims.w * 0.55;
  let hh = r.dims.y * r.dims.w * 0.55;
  return vec2f(wp.x / hw, wp.y / hh);
}

struct SOut {
  @builtin(position) pos: vec4f,
  @location(0) q: vec2f,
  @location(1) lum: f32,
};
/* 每个通道格元绘制为朝向相机的小缎带（在 2D 中） */
@vertex
fn vmain(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> SOut {
  var corners = array<vec2f,6>(
    vec2f(-1.0,-1.0), vec2f(1.0,-1.0), vec2f(-1.0,1.0),
    vec2f(1.0,-1.0),  vec2f(1.0,1.0),  vec2f(-1.0,1.0));
  let idx = list.items[ii];
  var p0 = cellWorld(idx);
  let par = parent[idx];
  var p1 = p0 + vec2f(0.0, r.dims.w * 0.6);
  if (par != 0xffffffffu) { p1 = cellWorld(par); }
  let mid = (p0 + p1) * 0.5;
  let lum = cellLum(idx);
  let w = r.dims.w * (0.10 + 0.075 * feedFactor(idx)
                      + 0.95 * pow(clamp(lum / 96.0, 0.0, 4.0), 0.33));
  var axis = p1 - p0;
  let L = max(length(axis), 1e-3);
  axis = axis / L;
  /* 2D：侧向与轴向垂直（将轴向旋转 90°） */
  let side = vec2f(-axis.y, axis.x);
  let c = corners[vi];
  var o: SOut;
  o.q = c; o.lum = lum;
  let ep = mid + axis * c.x * (L * 0.5 + w) + side * c.y * w;
  let ndc = toNDC(ep);
  o.pos = vec4f(ndc, 0.0, 1.0);
  return o;
}
@fragment
fn fmain(@location(0) q: vec2f, @location(1) lum: f32) -> @location(0) vec4f {
  let fall = exp(-q.y * q.y * 4.2);
  /* ~30 000 K 等离子体：白色核心，N2/N2+ 紫蓝色边缘 */
  let fringe = vec3f(0.46, 0.36, 1.00);
  let core   = vec3f(1.00, 0.97, 1.00);
  let col = mix(fringe, core, clamp(lum * 0.012, 0.0, 1.0));
  return vec4f(col * lum * fall * 0.09, 1.0);
}
