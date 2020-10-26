/**
 * @module GzipResource
 */
import zlib from 'zlib';
import HttpHeaders from '../http/HttpHeaders';
import HttpResource from './HttpResource';

export default class GzipResource extends HttpResource {

  getInputStream() {
    const stream = super.getInputStream();
    return stream.pipe(zlib.createGzip());
  }

  getInputRangeStream(start: number, end: number) {
    const stream = super.getInputRangeStream(start, end);
    return stream.pipe(zlib.createGunzip());
  }

  getResponseHeaders() {
    return {
      [HttpHeaders.CONTENT_ENCODING]: 'gzip'
    }
  }
}