struct List { count: atomic<u32>, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read> phiA: array<f32>;
@group(0) @binding(2) var<storage, read_write> flags: array<u32>;
@group(0) @binding(3) var<storage, read_write> addedT: array<f32>;
@group(0) @binding(4) var<storage, read_write> parent: array<u32>;
@group(0) @binding(5) var<storage, read_write> sel: Sel;
@group(0) @binding(6) var<storage, read_write> upSel: Sel;
@group(0) @binding(7) var<storage, read> terrain: array<u32>;
@group(0) @binding(8) var<storage, read_write> list: List;
@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  if (u.upOn == 0u) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // 已形成衔接点：冻结
  let i = cidx(gid.x, gid.y, u.gw);
  let f = flags[i];
  if ((f & 5u) != 0u) { return; }
  let ty = terrain[gid.x];
  if (gid.y >= ty) { return; }
  var cand = (f & 8u) == 8u;
  if (!cand && gid.y * 4u >= u.gh * 3u) { cand = gid.y + 1u >= ty; }
  if (!cand) { return; }
  let w = 1.0 - phiA[i];
  let key = gumbelKey(i, u.eta, u.seed, upSel.stepc, w);
  if (ordf(key) != atomicLoad(&upSel.key)) { return; }
  if (atomicExchange(&upSel.claim, 1u) != 0u) { return; }   // 仅一个胜者

  /* 附着到最新的地面树相邻格元，标记前沿，
     并检查是否与云树接触 —— 即衔接点 */
  var bestT = -1e9; var par = 0xffffffffu;
  for (var dy = -1i; dy <= 1i; dy = dy + 1i) {
    for (var dx = -1i; dx <= 1i; dx = dx + 1i) {
      if (dx == 0i && dy == 0i) { continue; }
      let nx = i32(gid.x) + dx; let ny = i32(gid.y) + dy;
      if (nx < 0i || ny < 0i ||
          nx >= i32(u.gw) || ny >= i32(u.gh)) { continue; }
      let ni = cidx(u32(nx), u32(ny), u.gw);
      let fn2 = flags[ni];
      if ((fn2 & 4u) == 4u) {
        if (addedT[ni] > bestT) { bestT = addedT[ni]; par = ni; }
      } else if ((fn2 & 1u) == 1u) {
        sel.sidx = ni;                               // 衔接点的云侧
        sel.gidx = i;                                // 衔接点的地侧
        atomicStore(&sel.strike, 1u);
      } else {
        flags[ni] = flags[ni] | 8u;                  // 扩展地面前沿
      }
    }
  }
  flags[i]  = 4u;                                      // 加入地面树
  addedT[i] = u.time;
  parent[i] = par;                                     // 0xffffffff = 扎根于岩石
  var anc = par;
  var g = 0u;
  loop {
    if (anc == 0xffffffffu || g > 4096u) { break; }
    flags[anc] = flags[anc] + 16u;
    anc = parent[anc];
    g = g + 1u;
  }
  let slot = atomicAdd(&list.count, 1u);
  if (slot < list.cap) { list.items[slot] = i; }
}
