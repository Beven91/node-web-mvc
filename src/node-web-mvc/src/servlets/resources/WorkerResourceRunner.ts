/**
 * WorkerResourceRunner 可用于WorkerResourceResolver提供的workerJs
 * 在workerJs中可以使用当前类实例来运行请求交互
 */
import { parentPort } from 'worker_threads';
import { Middleware } from '../../interface/declare';
import WorkerIncomingMessage, { } from './WorkerIncomingMessage';
import WorkerServerResponse from './WorkerServerResponse';
import { WorkerRequestValue } from './WorkerInvoker';

export default class WorkerResourceRunner {
  private readonly middlewares: Middleware[];

  constructor(...middlewares: Middleware[]) {
    this.middlewares = middlewares;
    parentPort.on('message', this.onRequest.bind(this));
  }


  private async onRequest(info: WorkerRequestValue) {
    const port = info.port;
    try {
      const request = new WorkerIncomingMessage(info);
      const response = new WorkerServerResponse(request);
      await new Promise((resolve, reject) => {
        const middlewares = [
          ...this.middlewares,
          // 404
          () => port.postMessage({ type: 'finished' }),
        ];
        const handler = middlewares.reverse().reduce((next: any, middleware) => {
          return () => {
            try {
              middleware(request, response, (ex) => (ex ? reject(ex) : next()));
            } catch (ex) {
              reject(ex);
            }
          };
        });
        handler(request, response, resolve);
      });
    } catch (ex) {
      port.postMessage({ type: 'error', error: ex });
    }
  }
}
