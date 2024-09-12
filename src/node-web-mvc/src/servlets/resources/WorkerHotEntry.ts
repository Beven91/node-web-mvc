import hot, { HotOptions } from '../../hmr/src/index';
import { parentPort, workerData } from 'worker_threads';

export interface WorkDataInfo {
  workerJs: string;
  hot?: HotOptions
}

const data = workerData as WorkDataInfo;

if (data.hot) {
  hot.run(workerData.hot);
}

// 启动worker代码
require(data.workerJs);

hot.create(module).preend(() => {
  parentPort.removeAllListeners('message');
});
