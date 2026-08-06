@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read_write> flags: array<u32>;
@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  let i = cidx(gid.x, gid.y, u.gw);
  var f = flags[i] & ~(2u | 8u);                       // 清空两个前沿
  if ((f & 5u) == 0u) {                                // 仅对空中的空白格
    let fx = u.forkIdx % u.gw;
    let fy = (u.forkIdx / u.gw) % u.gh;
    let dx = abs(i32(gid.x) - i32(fx));
    let dy = abs(i32(gid.y) - i32(fy));
    if (max(dx, dy) == 1) { f = f | 2u; }              // 分叉处的 8-邻域
  }
  flags[i] = f;
}
