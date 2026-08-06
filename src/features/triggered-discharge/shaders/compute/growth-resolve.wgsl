struct List { count: atomic<u32>, cap: u32, p2: u32, p3: u32, items: array<u32> };
@group(0) @binding(0) var<uniform> u: SimU;
@group(0) @binding(1) var<storage, read_write> phiA: array<f32>;
@group(0) @binding(2) var<storage, read_write> phiB: array<f32>;
@group(0) @binding(3) var<storage, read_write> flags: array<u32>;
@group(0) @binding(4) var<storage, read_write> addedT: array<f32>;
@group(0) @binding(5) var<storage, read_write> parent: array<u32>;
@group(0) @binding(6) var<storage, read_write> sel: Sel;
@group(0) @binding(7) var<storage, read> terrain: array<u32>;
@group(0) @binding(8) var<storage, read_write> list: List;
@compute @workgroup_size(8,8,1)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  if (gid.x >= u.gw || gid.y >= u.gh) { return; }
  if (atomicLoad(&sel.strike) == 1u) { return; }       // 先导已衔接：冻结
  let i = cidx(gid.x, gid.y, u.gw);
  if ((flags[i] & 7u) != 2u) { return; }               // 云侧前沿，且不在树内
  if (gid.y >= terrain[gid.x]) { return; }
  let key = gumbelKey(i, u.eta, u.seed, sel.stepc, phiA[i]);
  if (ordf(key) != atomicLoad(&sel.key)) { return; }
  if (atomicExchange(&sel.claim, 1u) != 0u) { return; } // 仅允许恰好一个胜者

  /* 附着到最近扩展的相邻通道格元（活跃尖端），并将 8-邻域标记为新的候选前沿 */
  var bestT = -1e9; var par = 0xffffffffu;
  for (var dy = -1i; dy <= 1i; dy = dy + 1i) {
    for (var dx = -1i; dx <= 1i; dx = dx + 1i) {
      if (dx == 0i && dy == 0i) { continue; }
      let nx = i32(gid.x) + dx; let ny = i32(gid.y) + dy;
      if (nx < 0i || ny < 0i ||
          nx >= i32(u.gw) || ny >= i32(u.gh)) { continue; }
      let ni = cidx(u32(nx), u32(ny), u.gw);
      let fn2 = flags[ni];
      if ((fn2 & 1u) == 1u) {
        if (addedT[ni] > bestT) { bestT = addedT[ni]; par = ni; }
      } else if ((fn2 & 4u) == 4u) {
        /* 触碰到上行衔接先导：形成衔接点 */
        sel.gidx = ni;
        atomicStore(&sel.strike, 1u);
      } else {
        flags[ni] = flags[ni] | 2u;                  // 扩展云侧前沿
      }
    }
  }
  flags[i]  = 1u;                                      // 通道（前沿位已清除）
  phiA[i]   = 0.0;
  phiB[i]   = 0.0;
  addedT[i] = u.time;
  parent[i] = par;
  /* 段内的先导电流 ~ 向下馈送的电荷：将每个祖先格元累计到这一新格元
     （flags 位 2+ = 后代计数）。主干积累成千上万，死端细枝保持为零。 */
  var anc = par;
  var g = 0u;
  loop {
    if (anc == 0xffffffffu || g > 4096u) { break; }
    flags[anc] = flags[anc] + 16u;       // 馈流现在存放在位 4+ 中
    anc = parent[anc];
    g = g + 1u;
  }
  sel.sidx  = i;
  atomicMax(&sel.deepY, gid.y);          // 追踪下降中的尖端
  let slot = atomicAdd(&list.count, 1u);
  if (slot < list.cap) { list.items[slot] = i; }
  if (gid.y + 1u >= terrain[gid.x]) {
    sel.gidx = 0xffffffffu;                            // 裸露地形衔接
    atomicStore(&sel.strike, 1u);
  }
}
