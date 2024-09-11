import { IncomingMessage } from 'http';
import { Socket } from 'net';

export function getRawValues(raw:string[]) {
  const data: Record<string, string> = {};
  for (let n=0; n< raw.length; n+=2) {
    data[raw[n]] = raw[n+1];
  }
  return data;
}

export default class WorkerIncomingMessage extends IncomingMessage {
  aborted: boolean;
  complete: boolean;
  connection: Socket;
  socket: Socket;

  httpVersion: string;
  httpVersionMajor: number;
  httpVersionMinor: number;
  rawHeaders: string[];
  trailers: NodeJS.Dict<string>;
  rawTrailers: string[];
  method?: string | undefined;
  url?: string | undefined;

  public readonly requestId: string;

  constructor(options: WorkerRequestValue) {
    super(null);
    const meta = options.request;
    this.requestId = options.id;
    this.url = meta.url;
    this.method = meta.method;
    this.rawHeaders = meta.rawHeaders;
    this.rawTrailers = meta.rawTrailers;
    this.httpVersion = meta.httpVersion;
    this.httpVersionMajor = meta.httpVersionMajor;
    this.httpVersionMinor = meta.httpVersionMinor;
    this.headers = getRawValues(this.rawHeaders);
    this.trailers = getRawValues(this.rawTrailers);
  }

  static serialize(req: IncomingMessage) {
    return {
      url: req.url,
      method: req.method,
      rawHeaders: req.rawHeaders,
      rawTrailers: req.rawTrailers,
      httpVersion: req.httpVersion,
      httpVersionMajor: req.httpVersionMajor,
      httpVersionMinor: req.httpVersionMinor,
    };
  }
}

export interface WorkerRequestValue {
  // 唯一的请求id
  id: string
  // 原始请求对象
  request: ReturnType<typeof WorkerIncomingMessage.serialize>
}
