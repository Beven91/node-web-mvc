import { IncomingMessage } from 'http';
import WorkerSocket, { } from './WorkerSocket';
import WorkerInvoker, { WorkerRequestValue } from './WorkerInvoker';

export function getRawValues(raw: string[]) {
  const data: Record<string, string> = {};
  for (let n = 0; n < raw.length; n += 2) {
    data[raw[n]] = raw[n + 1];
  }
  return data;
}

export default class WorkerIncomingMessage extends IncomingMessage {
  complete: boolean;
  connection: WorkerSocket;
  socket: WorkerSocket;

  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;
  rawHeaders: string[];
  trailers: NodeJS.Dict<string>;
  rawTrailers: string[];
  method?: string | undefined;
  url?: string | undefined;

  readableEncoding: BufferEncoding;

  workerPort: MessagePort;

  invoker: WorkerInvoker;

  constructor(options: WorkerRequestValue) {
    super(new WorkerSocket(options.port, 'requestSocket', options.request.socket.address));
    const meta = options.request;
    this.url = meta.url;
    this.workerPort = options.port;
    this.method = meta.method;
    this.rawHeaders = meta.rawHeaders;
    this.rawTrailers = meta.rawTrailers;
    this.httpVersion = meta.httpVersion;
    this.httpVersionMajor = meta.httpVersionMajor;
    this.httpVersionMinor = meta.httpVersionMinor;
    this.headers = getRawValues(this.rawHeaders);
    this.trailers = getRawValues(this.rawTrailers);
    Object.defineProperty(this, 'readableEncoding', { value: this.readableEncoding });
    this.invoker = new WorkerInvoker(options.port);
  }

  addListener(event: string, listener: (...args) => void): this {
    super.addListener(event, listener);
    this.invoker.addEventListener('request', this, event, listener);
    return this;
  }

  once(event: string, listener: (...args: any[]) => void): this {
    super.once(event, listener);
    this.invoker.addEventListener('request', this, event, listener, true);
    return this;
  }

  on(event: string, listener: (...args: any[]) => void): this {
    return this.addListener(event, listener);
  }
}


