import hot, { } from '../../hmr/src/index';
import fs from 'fs';
import path from 'path';
import { parentPort, workerData } from 'worker_threads';
import { WorkDataInfo } from './WorkerInvoker';

const data = workerData as WorkDataInfo;

if (data.dev) {
  // 热更新
  hot.run({
    cwd: [ process.cwd() ],
  });
  hot.create(module).preend(() => {
    parentPort.removeAllListeners('message');
  });

  const resolveJsFile = (filename: string) => {
    const name = path.relative(data.rootDir, filename);
    return path.join(data.outDir, name.replace('.ts', '.js'));
  };

  require.extensions['.ts'] = function(m, filename) {
    const id = resolveJsFile(filename);
    const source = fs.readFileSync(id).toString('utf-8');
    (m as any)._compile(source, filename);
  };
}

// 启动worker代码
require(data.workerJs);
