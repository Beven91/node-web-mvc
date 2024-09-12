import path from 'path';
import { Worker, WorkerOptions } from 'worker_threads';
import ResourceResolver from './ResourceResolver';
import Resource from './Resource';
import ResourceResolverChain from './ResourceResolverChain';
import { randomUUID } from 'crypto';
import HttpServletRequest from '../http/HttpServletRequest';
import type { MyGlobal } from 'shared-types';
import WorkerIncomingMessage from './WorkerIncomingMessage';
import HttpServletResponse from '../http/HttpServletResponse';
import { WorkerResponseValue } from './WorkerServerResponse';
import type { WorkDataInfo } from './WorkerHotEntry';

interface ExtWorkerOptions extends WorkerOptions {
  workerData?: WorkDataInfo
}

export default class WorkerResourceResolver implements ResourceResolver {
  private worker: Worker;

  constructor(workerJs: string) {
    const options: ExtWorkerOptions = {};
    const myGlobal = global as MyGlobal;
    options.env = process.env;
    options.workerData = {
      workerJs: workerJs,
    };
    if (myGlobal.nodeWebMvcStarter && path.extname(workerJs) == '.ts') {
      // 如果是开发模式
      workerJs = myGlobal.nodeWebMvcStarter.resolveOutputFile(workerJs);
      options.workerData.workerJs = workerJs;
      options.workerData.hot = {
        cwd: [ myGlobal.nodeWebMvcStarter.outDir ],
        includeNodeModules: true,
      };
    }
    this.worker = new Worker(require.resolve('./WorkerHotEntry'), options);
  }

  private setResponseHeaders(response: HttpServletResponse, value: WorkerResponseValue) {
    Object.keys(value.headers || {}).forEach((name) => {
      response.setHeader(name, value.headers[name]);
    });
  }

  private sendRequest(request: HttpServletRequest) {
    return new Promise<WorkerResponseValue>((resolve, reject) => {
      const id = randomUUID();
      const response = request.servletContext.response;
      const onFinished = (value: WorkerResponseValue) => {
        if (value.id != id) return;
        // 设置返回头信息
        this.setResponseHeaders(response, value);
        switch (value.type) {
          case 'write':
            // 如果写出内容
            response.write(Buffer.from(value.buffer));
            return;
          case 'write-head':
            if (value.statusCode) {
              response.setStatus(value.statusCode);
            }
            return;
          case 'error':
            reject(value.error);
            break;
          case 'finish':
            if (value.statusCode) {
              response.setStatus(value.statusCode);
            }
            if (value.buffer) {
              response.end(Buffer.from(value.buffer), value.encoding);
            } else {
              response.end();
            }
          default:
            resolve(value);
            break;
        }
        // 移除本次请求事件监听
        this.worker.off('message', onFinished);
      };
      this.worker.on('message', onFinished);
      this.worker.postMessage({
        id: id,
        request: WorkerIncomingMessage.serialize(request.nativeRequest),
      });
    });
  }

  async resolveResource(request: HttpServletRequest, requestPath: string, locations: Array<Resource>, next: ResourceResolverChain): Promise<Resource> {
    const response = await this.sendRequest(request);
    if (response.statusCode == 404) {
      return next.resolveResource(request, requestPath, locations);
    }
    return null;
  }

  resolveUrlPath(resourcePath: string, locations: Array<Resource>, chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}
