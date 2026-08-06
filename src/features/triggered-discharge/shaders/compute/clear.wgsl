struct List { count: atomic<u32>, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read_write> phiA: array<f32>;
@group(0) @binding(2) var<storage, read_write> phiB: array<f32>;
@group(0) @binding(3) var<storage, read_write> flags: array<u32>; 
@group(0) @binding(4) var<storage, read_write> addedT: array<f32>;
@group(0) @binding(5) var<storage, read_write> parent: array<u32>;
@group(0) @binding(6) var<storage, read_write> pathPos: array<f32>;
@group(0) @binding(7) var<storage, read_write> terrain: array<u32>;
@group(0) @binding(8) var<storage, read_write> list: List;

@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  /* 每次闪电仅缓存一次地形电极高度场 */
  if (gid.y == 0u) {
    terrain[gid.x] = terrainRow(gid.x, u.gw, u.gh, u.bs);
  }
  let i = cidx(gid.x, gid.y, u.gw);
  var phi = f32(gid.y) / f32(u.gh - 1u);      // 线性预热启动
  var st  = 0u;
  var at  = -1e4;
  var par = 0xffffffffu;
  /* 种子：从云底悬垂的短钟乳石 */
  if (gid.x == u.seedX && gid.y < 5u) {
    st = 1u; phi = 0.0; at = u.time;
    if (gid.y > 0u) { par = cidx(gid.x, gid.y - 1u, u.gw); }
    let slot = atomicAdd(&list.count, 1u);
    if (slot < list.cap) { list.items[slot] = i; }
  }
  /* 围绕种子列晶格的确定性初始候选壳层 */
  var cd = 0u;
  let adjX = (gid.x + 1u >= u.seedX) && (gid.x <= u.seedX + 1u);
  if (st == 0u && adjX && gid.y < 6u) { cd = 1u; }
  phiA[i] = phi; phiB[i] = phi;
  flags[i] = st | (cd << 1u); addedT[i] = at; parent[i] = par;
  pathPos[i] = -1.0;
}
