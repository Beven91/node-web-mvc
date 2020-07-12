/**
 * @module MemoryStream
 * @description 一次性读取整个请求内容
 */
import { Writable } from 'stream'
import HttpServletRequest from '../servlets/http/HttpServletRequest';

export default class RequestMemoryStream extends Writable {

  private readBuffers: Buffer

  constructor(request: HttpServletRequest, handler: (chunks) => void) {
    super();
    this.readBuffers = Buffer.from([]);
    request.nativeRequest.pipe(this);
    this.on('finish', () => {
      handler(this.readBuffers);
      this.readBuffers = null;
    })
  }

  _write(chunk, encoding, cb) {
    this.readBuffers = Buffer.concat([this.readBuffers, chunk]);
    cb();
  }
}