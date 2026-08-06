@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phiIn: array<f32>;
@group(0) @binding(2) var<storage, read_write> phiOut: array<f32>;
@group(0) @binding(3) var<storage, read> flags: array<u32>;
@group(0) @binding(4) var<storage, read> terrain: array<u32>;

@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  let i = cidx(gid.x, gid.y, u.gw);
  if (gid.y >= terrain[gid.x]) { phiOut[i] = 1.0; return; } // 地形电极
  let fj = flags[i];
  if ((fj & 1u) == 1u) { phiOut[i] = 0.0; return; }   // 云树：云电位
  if ((fj & 4u) == 4u) { phiOut[i] = 1.0; return; }   // 地面树：地电位
  /* 通过钳制采样实现 Nehmann 侧边界与上边界；4-邻域 Laplacian */
  let xl = select(gid.x - 1u, 0u,        gid.x == 0u);
  let xr = select(gid.x + 1u, u.gw - 1u, gid.x == u.gw - 1u);
  let yu = select(gid.y - 1u, 0u,        gid.y == 0u);
  let yd = gid.y + 1u;
  phiOut[i] = ( phiIn[cidx(xl, gid.y, u.gw)] + phiIn[cidx(xr, gid.y, u.gw)]
              + phiIn[cidx(gid.x, yu, u.gw)]  + phiIn[cidx(gid.x, yd, u.gw)]
              ) / 4.0;
}
