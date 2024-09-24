import path from 'path';
import { Worker } from 'worker_threads';
import ResourceResolver from './ResourceResolver';
import Resource from './Resource';
import ResourceResolverChain from './ResourceResolverChain';
import HttpServletRequest from '../http/HttpServletRequest';
import type { MyGlobal } from 'shared-types';
import { WorkerResponseValue } from './WorkerServerResponse';
import WorkerInvoker, { ResolverWorker, RessolverWorkerOptions, WorkerResponseData } from './WorkerInvoker';


export default class WorkerResourceResolver implements ResourceResolver {
  private worker: ResolverWorker;

  constructor(workerJs: string) {
    const options: RessolverWorkerOptions = {};
    const myGlobal = global as MyGlobal;
    options.env = process.env;
    options.workerData = {
      workerJs: workerJs,
    };
    if (myGlobal.nodeWebMvcStarter && path.extname(workerJs) == '.ts') {
      // 如果是开发模式
      options.workerData.dev = true;
      options.workerData.rootDir = myGlobal.nodeWebMvcStarter.rootDir;
      options.workerData.outDir = myGlobal.nodeWebMvcStarter.outDir;
    }
    this.worker = new Worker(require.resolve('./WorkerEntry'), options);
  }

  private sendRequest(request: HttpServletRequest) {
    return new Promise<WorkerResponseValue>((resolve, reject) => {
      const { port1, port2 } = new MessageChannel();
      const response = request.servletContext.response;
      const onFinished = (ev: MessageEvent) => {
        const value = ev.data as WorkerResponseData;
        switch (value.type) {
          case 'bind-event':
            WorkerInvoker.bindEventListener(value, port1, request.nativeRequest, response.nativeResponse);
            return;
          case 'error':
            reject(value.error);
            break;
          case 'finished':
            resolve(null);
            break;
          case 'invoke':
            WorkerInvoker.onInvoke(value, port1, request.nativeRequest, response.nativeResponse);
            if (!(value.invoke.method == 'end' && value.invoke.target == 'response')) {
              return;
            }
        }
        // 关闭消息通道
        port1.close();
        port2.close();
      };
      port1.addEventListener('message', onFinished);
      this.worker.postMessage(
        {
          request: WorkerInvoker.serializeRequest(request.nativeRequest),
          port: port2,
        },
        [ port2 as any ]
      );
    });
  }

  async resolveResource(request: HttpServletRequest, requestPath: string, locations: Array<Resource>, next: ResourceResolverChain): Promise<Resource> {
    const response = await this.sendRequest(request);
    if (response?.statusCode == 404) {
      return next.resolveResource(request, requestPath, locations);
    }
    return null;
  }

  resolveUrlPath(resourcePath: string, locations: Array<Resource>, chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}
