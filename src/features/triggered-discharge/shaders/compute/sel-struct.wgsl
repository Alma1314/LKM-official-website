struct Sel {
  key:    atomic<u32>,
  claim:  atomic<u32>,
  stepc:  u32,
  strike: atomic<u32>,
  sidx:   u32,           // 云侧衔接格元
  gidx:   u32,           // 地侧衔接格元（0xffffffff = 裸露地形）
  deepY:  atomic<u32>,   // 目前已扩展的最深先导行（用于击穿距离）
  pad:    u32,
};
