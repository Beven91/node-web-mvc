import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import { IncomingMessage, ServerResponse } from 'http';
import { TransferListItem, Worker, WorkerOptions } from 'worker_threads';

export type WorkerResponseData =
  | { type: 'finished' }
  | { type: 'error'; error: Error }
  | { type: 'invoke'; invoke: { id: string; target: string; method: string; args: any[] } }
  | { type: 'callback'; callbackId: string; callbackValues: any[] }
  | { type: 'bind-event'; event: { id: string; name: string; target: string } }
  | { type: 'remove-event'; event: { id: string; name: string; target: string } };

export type WorkerInvokeData = Extract<WorkerResponseData, { type: 'invoke' }>;
export type WorkerEventData = Extract<WorkerResponseData, { type: 'bind-event' | 'remove-event' }>;

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

  /**
   * 智能序列化 Buffer/Uint8Array
   * 检测是否池化：如果 Buffer 占满整个 ArrayBuffer，直接 transfer（零拷贝）
   * 否则使用 slice 创建副本（避免池化风险）
   */
  static serializeBuffer(val: Uint8Array): { serialized: any; transfer: ArrayBuffer | null } {
    const buffer = val.buffer;
    // 检测是否池化：Buffer 占满整个 ArrayBuffer 说明不是池化的
    const isNotPooled = val.byteOffset === 0 && val.byteLength === buffer.byteLength;

    if (isNotPooled) {
      // 非池化，直接 transfer（零拷贝）
      return {
        serialized: {
          __type: 'Uint8Array',
          buffer,
          byteOffset: 0,
          byteLength: val.byteLength,
        },
        transfer: buffer as ArrayBuffer,
      };
    }
    console.log('池化>>>');
    // 池化的 Buffer，创建副本避免影响同一 pool 中的其他 Buffer
    const copiedBuffer = buffer.slice(val.byteOffset, val.byteOffset + val.byteLength);
    return {
      serialized: {
        __type: 'Uint8Array',
        buffer: copiedBuffer,
        byteOffset: 0,
        byteLength: val.byteLength,
      },
      transfer: copiedBuffer as ArrayBuffer,
    };
  }

  static bindCallback(port: ResponseMessagePort, id: string, name: string) {
    return (...values) => {
      const transfer: ArrayBuffer[] = [];
      const serializedValues = values.map((val) => {
        if (val instanceof Uint8Array) {
          const { serialized, transfer: buf } = this.serializeBuffer(val);
          if (buf) transfer.push(buf);
          return serialized;
        }
        return val;
      });
      port.postMessage(
        {
          callbackValues: serializedValues,
          callbackId: id,
          type: 'callback',
        },
        transfer
      );
    };
  }

  /**
   * 反序列化从 Worker 线程传递过来的参数
   * 将 { __type: 'Uint8Array', buffer, byteOffset, byteLength } 转换回 Buffer
   */
  static deserializeArgs(args: any[]): any[] {
    return args.map((arg) => {
      if (arg && typeof arg === 'object' && arg.__type === 'Uint8Array') {
        // 从 ArrayBuffer 重建 Buffer
        return Buffer.from(arg.buffer, arg.byteOffset, arg.byteLength);
      }
      return arg;
    });
  }

  static onInvoke(info: WorkerInvokeData, port: MessagePort, request: IncomingMessage, response: ServerResponse) {
    const invoke = info.invoke;
    const name = invoke.target + '.' + invoke.method;
    const callback = this.bindCallback(port, invoke.id, name);
    // 反序列化参数
    const args = this.deserializeArgs(invoke.args);
    const socket = (invoke.target == 'responseSocket' ? response.socket : request.socket)!;
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
      case 'request.read':
        request.read(args[0]);
        break;
      default:
        callback();
        break;
    }
  }

  static bindEventListener(info: WorkerEventData, port: ResponseMessagePort, request: IncomingMessage, response: ServerResponse) {
    const mappings = {
      'response': response,
      'request': request,
      'responseSocket': response.socket,
      'requestSocket': request.socket,
    };
    const event = info.event;
    const id = event.id;
    const obj = mappings[event.target] as EventEmitter;
    const name = `event:${event.target}.${event.name}`;
    const handler = this.bindCallback(port, id, name);
    obj.addListener(event.name, handler);
    const onRemove = (info: MessageEvent) => {
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
      const transfer: ArrayBuffer[] = [];
      const serializedArgs = args.map((arg) => {
        if (arg instanceof Uint8Array) {
          const { serialized, transfer: buf } = WorkerInvoker.serializeBuffer(arg);
          if (buf) transfer.push(buf);
          return serialized;
        }
        return arg;
      });
      const onCallback = (ev: MessageEvent) => {
        const data = ev.data as WorkerResponseData;
        if (data.type !== 'callback' || data.callbackId !== id) return;
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
            args: serializedArgs,
          },
        },
        transfer
      );
    });
  }

  addEventListener(target: InvokeTargetType, event: string, handler: (...args: any) => void, once?: boolean) {
    if (!handler) {
      return;
    }
    const id = `${event}_${randomUUID()}`;
    const invokeHandler = (e: MessageEvent) => {
      const data = (e.data || {}) as WorkerResponseData;
      if (data.type == 'callback' && data.callbackId == id) {
        // 反序列化回调值
        const values = WorkerInvoker.deserializeArgs(data.callbackValues);
        handler(...values);
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
