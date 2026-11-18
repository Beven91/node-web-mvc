/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const PKGS = [
  { name: 'node-web-mvc', script: 'watch' },
  { name: 'node-web-mvc-starter', script: 'watch-st' },
];
const EXAMPLE = path.join(ROOT, 'src/node-web-mvc-example');

const isWin = process.platform === 'win32';
const children = new Set();
let server = null;
let timer = null;
let exiting = false;

// 统一封装 spawn：记录所有子进程，Unix 下用 detached 以便杀进程组
function spawnProc(cmd, args, opts = {}) {
  const child = spawn(cmd, args, {
    stdio: 'inherit',
    shell: true,
    detached: !isWin,
    ...opts,
  });
  children.add(child);
  child.on('exit', () => children.delete(child));
  return child;
}

function killChild(child) {
  if (!child) return;
  if (isWin) {
    spawn('taskkill', [ '/pid', child.pid, '/T', '/F' ], { stdio: 'ignore' });
  } else {
    try {
 process.kill(-child.pid, 'SIGTERM');
} catch (_) {/* 忽略进程已退出 */}
  }
}

function killAll() {
  for (const child of children) killChild(child);
  children.clear();
  server = null;
}

let started = false;

// 重启时只杀 dev server，保留 watch 进程
function killServer() {
  if (server) killChild(server);
  server = null;
}

function start() {
  killServer();
  console.log('[dev] starting example server...');
  server = spawnProc('npm', [ 'start' ], { cwd: EXAMPLE });
  started = true;
}

// 防抖：首次用长延迟吸收两个 tsc 编译时间差，后续用短延迟
function onChange() {
  clearTimeout(timer);
  timer = setTimeout(start, started ? 400 : 3000);
}

// ---- 监听 dist 目录 ----
const watched = new Set();
function watchDist(pkg) {
  const dist = path.join(ROOT, 'src', pkg, 'dist');
  if (!fs.existsSync(dist) || fs.readdirSync(dist).length === 0) return false;
  if (!watched.has(pkg)) {
    watched.add(pkg);
    fs.watch(dist, { recursive: true }, onChange);
  }
  return true;
}
// ---- 主进程退出时清理所有子进程 ----
function shutdown() {
  if (exiting) return;
  exiting = true;
  killAll();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGHUP', shutdown);

// ---- 启动 ----
// 1) 启动两个 tsc --watch
for (const s of PKGS) {
  spawnProc('npm', [ 'run', s.script ], { cwd: ROOT });
}

// 2) 轮询等待 dist/ 就绪 → 绑定监听 → 防抖启动 dev server
(function poll() {
  if (exiting) return;
  if (PKGS.every((p) => watchDist(p.name))) onChange();
  else setTimeout(poll, 600);
})();
