@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phi: array<f32>;
@group(0) @binding(2) var<storage, read> flags: array<u32>;
@group(0) @binding(3) var<storage, read_write> sel: Sel;
@group(0) @binding(4) var<storage, read> terrain: array<u32>;
@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // 先导已衔接：冻结
  let i = cidx(gid.x, gid.y, u.gw);
  if ((flags[i] & 7u) != 2u) { return; }               // 云侧前沿，且不在树内
  if (gid.y >= terrain[gid.x]) { return; }
  let key = gumbelKey(i, u.eta, u.seed, sel.stepc, phi[i]);
  atomicMax(&sel.key, ordf(key));
}
