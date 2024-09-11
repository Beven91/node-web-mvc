import { OutgoingHttpHeader, ServerResponse } from 'http';
import WorkerIncomingMessage, { getRawValues } from './WorkerIncomingMessage';
import { parentPort } from 'worker_threads';
import { OutgoingHttpHeaders } from 'http2';

export interface WorkerResponseValue {
  id: string
  type: 'write' | 'write-head' | 'finish' | 'ignored' | 'error'
  error?: Error
  statusCode?: number
  encoding?: BufferEncoding
  headers?: Record<string, string>
  buffer?: Buffer
}

export default class WorkerServerResponse extends ServerResponse {
  private readonly request: WorkerIncomingMessage;

  private isHeaderSent: boolean;

  private getAllHeaders() {
    const outHeaders = this.getHeaders();
    const headers: Record<string, any> = {};
    Object.keys(outHeaders).forEach((name) => {
      headers[name] = outHeaders[name];
    });
    return headers;
  }

  writeTo(type: WorkerResponseValue['type'], data: any, headers: OutgoingHttpHeaders | OutgoingHttpHeader[], statusCode: number, encoding: BufferEncoding) {
    data = data ? Buffer.from(data) : undefined;
    const value = { id: this.request.requestId, statusCode, buffer: data, type, encoding } as WorkerResponseValue;
    if (!this.headersSent) {
      this.isHeaderSent = true;
      const allHeaders = this.getAllHeaders();
      const useHeaders = headers instanceof Array ? getRawValues(headers as string[]) : headers;
      if (useHeaders) {
        Object.keys(useHeaders).forEach((name) => {
          allHeaders[name] = useHeaders[name];
        });
      }
      value.headers = allHeaders;
    }
    parentPort.postMessage(value, [ value.buffer?.buffer ].filter(Boolean));
  }

  write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
  write(chunk: any, encoding: BufferEncoding, cb?: (error: Error | null | undefined) => void): boolean;
  write(chunk: any, arg1: any, cb?: (error: Error) => void) {
    const encoding = typeof arg1 === 'string' ? arg1 : undefined;
    const callback = typeof arg1 == 'function' ? arg1 : cb;
    this.writeTo('write', chunk, undefined, undefined, encoding as BufferEncoding);
    callback?.();
    return true;
  }

  writeHead(statusCode: number, statusMessage?: string, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this;
  writeHead(statusCode: number, headers?: OutgoingHttpHeaders | OutgoingHttpHeader[]): this;
  writeHead(statusCode: number, statusMessage?: unknown, headers?: unknown): this {
    this.statusCode = statusCode;
    this.statusMessage = typeof statusMessage == 'string' ? statusMessage : '';
    const vHeaders = typeof statusMessage == 'object' ? statusMessage : headers;
    this.writeTo('write-head', null, vHeaders as any, statusCode, undefined);
    return this;
  }

  end(cb?: () => void): this;
  end(chunk: any, cb?: () => void): this;
  end(chunk: any, encoding: BufferEncoding, cb?: () => void): this;
  end(chunk?: any, arg1?: unknown, cb?: any): this {
    const encoding = typeof arg1 === 'string' ? arg1 : undefined;
    const callback = typeof arg1 == 'function' ? arg1 : cb;
    this.writeTo('finish', chunk, undefined, this.statusCode, encoding as BufferEncoding);
    callback?.();
    return this;
  }

  constructor(req: WorkerIncomingMessage) {
    super(req);
    this.request = req;
    Object.defineProperty(this, 'headersSent', {
      get: ()=> this.isHeaderSent,
    });
  }
}
