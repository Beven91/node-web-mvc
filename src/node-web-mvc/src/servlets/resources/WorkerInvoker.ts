import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import { IncomingMessage, ServerResponse } from 'http';
import { TransferListItem, Worker, WorkerOptions } from 'worker_threads';

export interface WorkerResponseData {
  type: 'finished' | 'error' | 'invoke' | 'callback' | 'bind-event' | 'remove-event' | 'event'
  error?: Error
  event?: {
    id: string
    name: string
    target: string
  },
  callbackId?: string
  callbackValues?: any[]
  invoke?: {
    id: string
    target: string
    method: string
    args: any[]
  }
}

export type InvokeTargetType = 'request' | 'response' | 'responseSocket' | 'requestSocket';

interface ResponseMessagePort extends MessagePort {
  postMessage(message: WorkerResponseData, transfer: Transferable[]): void;
  postMessage(message: WorkerResponseData, options?: StructuredSerializeOptions): void;
}

export interface WorkerRequestValue {
  port: ResponseMessagePort
  // 原始请求对象
  request: ReturnType<typeof WorkerInvoker.serializeRequest>
}

export interface ResolverWorker extends Worker {
  postMessage(value: WorkerRequestValue, transferList?: ReadonlyArray<TransferListItem>): void;
}

export interface WorkDataInfo {
  rootDir?: string
  outDir?: string
  workerJs: string;
  dev?: boolean
}

export interface RessolverWorkerOptions extends WorkerOptions {
  workerData?: WorkDataInfo
}

export default class WorkerInvoker {
  port: ResponseMessagePort;

  static serializeRequest(req: IncomingMessage) {
    return {
      url: req.url,
      method: req.method,
      rawHeaders: req.rawHeaders,
      rawTrailers: req.rawTrailers,
      httpVersion: req.httpVersion,
      httpVersionMajor: req.httpVersionMajor,
      httpVersionMinor: req.httpVersionMinor,
      readableEncoding: req.readableEncoding,
      socket: {
        address: req.socket.address(),
      },
    };
  }

  constructor(port: MessagePort) {
    this.port = port;
  }

  static bindCallback(port: ResponseMessagePort, id: string) {
    return (...values) => {
      const transfer = values.filter((m) => m instanceof Uint8Array).map((m) => m.buffer);
      port.postMessage(
        {
          callbackValues: values,
          callbackId: id,
          type: 'callback',
        },
        transfer
      );
    };
  }

  static onInvoke(info: WorkerResponseData, port: MessagePort, request: IncomingMessage, response: ServerResponse) {
    const invoke = info.invoke;
    const name = invoke.target + '.' + invoke.method;
    const callback = this.bindCallback(port, invoke.id);
    const args = invoke.args;
    const socket = invoke.target == 'responseSocket' ? response.socket : request.socket;
    switch (name) {
      case 'response.write':
        response.write(args[0], args[1], callback);
        break;
      case 'response.writeHead':
        response.writeHead(args[0], args[1], args[2]);
        callback();
        break;
      case 'response.setHeader':
        response.setHeader(args[0], args[1]);
        callback();
        break;
      case 'response.end':
        response.end(args[0], args[1], callback);
        break;
      case 'responseSocket.setKeepAlive':
      case 'requestSocket.setKeepAlive':
        socket.setKeepAlive(...args);
        callback();
        break;
      case 'responseSocket.setNoDelay':
      case 'requestSocket.setNoDelay':
        socket.setNoDelay(args[0]);
        callback();
        break;
      case 'responseSocket.setEncoding':
      case 'requestSocket.setEncoding':
        socket.setEncoding(args[0]);
        callback();
        break;
      case 'responseSocket.pause':
      case 'requestSocket.pause':
        socket.pause();
        callback();
        break;
      case 'responseSocket.resume':
      case 'requestSocket.resume':
        socket.resume();
        callback();
      case 'responseSocket.ref':
      case 'requestSocket.ref':
        socket.ref();
        callback();
        break;
      case 'responseSocket.unref':
      case 'requestSocket.unref':
        socket.unref();
        callback();
      default:
        callback();
        break;
    }
  }

  static bindEventListener(info: WorkerResponseData, port: ResponseMessagePort, request: IncomingMessage, response: ServerResponse) {
    const mappings = {
      'response': response,
      'request': request,
      'responseSocket': response.socket,
      'requestSocket': request.socket,
    };
    const event = info.event;
    const id = event.id;
    const obj = mappings[event.target] as EventEmitter;
    const handler = this.bindCallback(port, id);
    obj.addListener(event.name, handler);
    const onRemove = (info: MessageEvent)=>{
      const data = info.data as WorkerResponseData;
      if (data.type == 'remove-event' && data.event?.id == event.id) {
        obj.removeListener(event.name, handler);
        port.removeEventListener('message', onRemove);
      }
    };
    port.addEventListener('message', onRemove);
  }

  /**
   * 执行主线程对象方法
   * @param target 要执行的对象名
   * @param method 要执行的方法名
   * @param args 参数
   * @returns
   */
  invoke(target: InvokeTargetType, method: string, args: any[]) {
    return new Promise((resolve, reject) => {
      const id = randomUUID();
      const transfer = args.filter((m) => m instanceof Uint8Array).map((m) => m.buffer);
      const onCallback = (ev: MessageEvent) => {
        const data = ev.data as WorkerResponseData;
        if (data.callbackId !== id && data.type == 'callback') return;
        this.port.removeEventListener('message', onCallback);
        resolve(data.callbackValues);
      };
      this.port.addEventListener('message', onCallback);
      this.port.postMessage(
        {
          type: 'invoke',
          invoke: {
            id: id,
            target,
            method,
            args,
          },
        },
        transfer
      );
    });
  }

  addEventListener(target: InvokeTargetType, object: EventEmitter, event: string, handler: (...args: any) => void, once?: boolean) {
    if (!handler) {
      return;
    }
    const id = `${event}_${randomUUID()}`;
    const invokeHandler = (e: MessageEvent) => {
      const data = (e.data || {}) as WorkerResponseData;
      if (data.type == 'event' && data.callbackId == id) {
        object.emit(event, ...data.callbackValues);
        once && this.removeEventListener(target, event, id, handler);
      }
    };
    handler[`@${event}`] = { id, handler: invokeHandler };
    // 监听事件回调
    this.port.addEventListener('message', invokeHandler);
    // 通知绑定事件
    this.port.postMessage({ type: 'bind-event', event: { id, name: event, target } });
  }

  removeEventListener(target: string, event: string, id: string, handler: (...args: any) => void) {
    if (!handler) {
      return;
    }
    const info = handler[`@${event}`];
    if (info) {
      this.port.postMessage({ type: 'remove-event', event: { id, name: event, target } });
      this.port.removeEventListener(event, info.handler);
    }
  }
}
