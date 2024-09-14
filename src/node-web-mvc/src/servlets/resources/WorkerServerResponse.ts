import { OutgoingHttpHeader, ServerResponse } from 'http';
import WorkerIncomingMessage from './WorkerIncomingMessage';
import { OutgoingHttpHeaders } from 'http2';
import WorkerSocket from './WorkerSocket';
import WorkerInvoker from './WorkerInvoker';

export interface WorkerResponseValue {
  id: string
  type: 'write' | 'write-head' | 'finish' | 'ignored' | 'error' | 'invoke'
  invoke?: {
    target: string
    method: string
    args: any[]
  },
  error?: Error
  statusCode?: number
  encoding?: BufferEncoding
  headers?: Record<string, string>
  buffer?: Buffer
}

export default class WorkerServerResponse extends ServerResponse {
  private isHeaderSent: boolean;

  private invoker: WorkerInvoker;

  write(chunk: Uint8Array | string, arg1: any, cb?: (error: Error) => void) {
    this.socket.write(chunk, arg1, cb);
    this.isHeaderSent = true;
    return true;
  }

  writeHead(statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this;
  writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this;
  writeHead(statusCode: number, statusMessage?: unknown, headers?: unknown): this {
    this.invoker.invoke('response', 'writeHead', [ statusCode, statusMessage, headers ]);
    this.isHeaderSent = true;
    return this;
  }

  end(chunk?: any, arg1?: any, cb?: any): this {
    this.socket.end(chunk, arg1, cb);
    this.isHeaderSent = true;
    return this;
  }

  setHeader(name: string, value: number | string | ReadonlyArray<string>): this {
    this.invoker.invoke('response', 'setHeader', [ name, value ]);
    super.setHeader(name, value);
    return this;
  }

  constructor(req: WorkerIncomingMessage) {
    super(req);
    this.assignSocket(new WorkerSocket(req.workerPort, 'responseSocket'));
    this.invoker = new WorkerInvoker(req.workerPort);
    Object.defineProperty(this, 'headersSent', {
      get: () => this.isHeaderSent,
    });
  }

  addListener(event: string, listener: (...args) => void): this {
    super.addListener(event, listener);
    this.invoker.addEventListener('response', this, event, listener);
    return this;
  }

  once(event: string, listener: (...args: any[]) => void): this {
    super.once(event, listener);
    this.invoker.addEventListener('response', this, event, listener, true);
    return this;
  }

  on(event: string, listener: (...args: any[]) => void): this {
    return this.addListener('response', listener);
  }
}
