@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phi: array<f32>;
@group(0) @binding(2) var<storage, read> flags: array<u32>;
@group(0) @binding(3) var<storage, read> terrain: array<u32>;
@group(0) @binding(4) var<storage, read_write> res: Res;
struct Res { m: atomic<u32>, p1: u32, p2: u32, p3: u32 };
fn ordf2(f: f32) -> u32 {
  let b = bitcast<u32>(f);
  if ((b & 0x80000000u) == 0u) { return b | 0x80000000u; }
  return ~b;
}
@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x == 0u || gid.y == 0u ||
      gid.x >= u.gw - 1u || gid.y >= u.gh - 1u) { return; }
  let i = cidx(gid.x, gid.y, u.gw);
  if ((flags[i] & 5u) != 0u) { return; }               // 电极被固定
  if (gid.y >= terrain[gid.x]) { return; }
  let avg = (phi[cidx(gid.x - 1u, gid.y, u.gw)]
           + phi[cidx(gid.x + 1u, gid.y, u.gw)]
           + phi[cidx(gid.x, gid.y - 1u, u.gw)]
           + phi[cidx(gid.x, gid.y + 1u, u.gw)]) / 4.0;
  let r = abs(phi[i] - avg);
  atomicMax(&res.m, ordf2(r));
}
