/**
 * @module MemoryStream
 * @description 一次性读取整个请求内容
 */
import { Writable } from 'stream';
import { IncomingMessage } from 'http';

export default class RequestMemoryStream extends Writable {
  private readBuffers: Buffer;

  static readBody(request: IncomingMessage) {
    return new Promise<Buffer>((resolve, reject) => {
      new RequestMemoryStream(request, (data: Buffer, ex: Error) => {
        ex ? reject(ex) : resolve(data);
      });
    });
  }

  constructor(request: IncomingMessage, handler: (chunks: Buffer, ex?: Error) => void) {
    super();
    this.readBuffers = Buffer.from([]);
    request.pipe(this);
    this.on('error', (ex) => handler(null, ex));
    this.on('finish', () => {
      handler(this.readBuffers);
      this.readBuffers = null;
    });
  }

  _write(chunk, encoding, cb) {
    this.readBuffers = Buffer.concat([ this.readBuffers, chunk ]);
    cb();
  }
}
