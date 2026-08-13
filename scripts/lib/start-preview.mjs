/**
 * Astro preview server 辅助：确保产物就绪后启动 preview（或复用已运行的实例）。
 * server 模式下页面 HTML 为运行时渲染，无法对 dist 静态文件做 HTML 检查，
 * 因此 SEO / 链接检查脚本通过本 helper 走 HTTP。
 *
 * 使用随机空闲端口避免连续调用（脚本串行/CI 并行）时的端口冲突，
 * 并以独立进程组启动/终止，确保 preview 及其子进程被完全清理。
 */
import { spawn } from 'node:child_process';
import net from 'node:net';

const READY_TIMEOUT_MS = 60_000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 获取一个空闲的本地端口（避免与残留服务冲突）。 */
function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

async function isReady(url) {
  try {
    const res = await fetch(url);
    return res.status < 500;
  } catch {
    return false;
  }
}

function killTree(child) {
  try {
    if (child.pid) process.kill(-child.pid, 'SIGTERM');
  } catch {
    // 进程组可能已退出
  }
  try {
    child.kill('SIGTERM');
  } catch {
    // ignore
  }
  child.stdout?.destroy();
  child.stderr?.destroy();
}

/**
 * 在 preview 服务存活期间执行 callback。
 * @param {(base: string) => Promise<void>} callback
 */
export async function withPreview(callback, preferredPort) {
  const port = preferredPort ?? (await getFreePort());
  const base = `http://127.0.0.1:${port}`;

  // 已有实例在跑则直接复用
  if (await isReady(base)) {
    await callback(base);
    return;
  }

  const child = spawn('pnpm', ['exec', 'astro', 'preview', '--host', '127.0.0.1', '--port', String(port)], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  });

  const deadline = Date.now() + READY_TIMEOUT_MS;
  let ready = false;
  let stderrBuf = '';
  child.stderr?.on('data', (d) => {
    stderrBuf += String(d);
    if (stderrBuf.length > 4000) stderrBuf = stderrBuf.slice(-4000);
  });

  while (Date.now() < deadline) {
    if (child.exitCode !== null) break;
    if (await isReady(base)) {
      ready = true;
      break;
    }
    await sleep(500);
  }

  if (!ready) {
    killTree(child);
    throw new Error(`Astro preview 未就绪（端口 ${port}）: ${stderrBuf.trim().split('\n').pop()}`);
  }

  try {
    await callback(base);
  } finally {
    killTree(child);
  }
}
