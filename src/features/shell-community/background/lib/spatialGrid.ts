/**
 * 空间哈希网格 — 将 O(n²) 粒子连接线查找降为 O(n) 邻域查询。
 * 每个粒子插入到对应网格单元，查询时只检查相邻单元。
 */
export class SpatialGrid<T> {
  private cells = new Map<number, Map<number, T>>();
  private cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  clear(): void {
    this.cells.clear();
  }

  private key(col: number, row: number): number {
    return col * 1_000_000 + row;
  }

  insert(id: number, x: number, y: number, data: T): void {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);
    const k = this.key(col, row);
    let cell = this.cells.get(k);
    if (!cell) {
      cell = new Map<number, T>();
      this.cells.set(k, cell);
    }
    cell.set(id, data);
  }

  /**
   * 查询 (x, y) 半径内的所有数据。
   * 调用方自行做精确距离检查。
   */
  query(x: number, y: number, radius: number): T[] {
    const results: T[] = [];
    const minCol = Math.floor((x - radius) / this.cellSize);
    const maxCol = Math.floor((x + radius) / this.cellSize);
    const minRow = Math.floor((y - radius) / this.cellSize);
    const maxRow = Math.floor((y + radius) / this.cellSize);

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const cell = this.cells.get(this.key(col, row));
        if (!cell) continue;
        for (const item of cell.values()) {
          results.push(item);
        }
      }
    }

    return results;
  }
}
