@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phi: array<f32>;
@group(0) @binding(2) var<storage, read> flags: array<u32>;
@group(0) @binding(3) var<storage, read_write> sel: Sel;
@group(0) @binding(4) var<storage, read_write> upSel: Sel;
@group(0) @binding(5) var<storage, read> terrain: array<u32>;
@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  if (u.upOn == 0u) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // 已形成衔接点：冻结
  let i = cidx(gid.x, gid.y, u.gw);
  let f = flags[i];
  if ((f & 5u) != 0u) { return; }                      // 已在树内
  let ty = terrain[gid.x];
  if (gid.y >= ty) { return; }                         // 在岩石内部
  var cand = (f & 8u) == 8u;                           // 被标记的地面前沿
  if (!cand && gid.y * 4u >= u.gh * 3u) {              // 低空带：地形表面
    cand = gid.y + 1u >= ty;
  }
  if (!cand) { return; }
  let w = 1.0 - phi[i];                                // 朝向先导的场强
  let key = gumbelKey(i, u.eta, u.seed, upSel.stepc, w);
  atomicMax(&upSel.key, ordf(key));
}
