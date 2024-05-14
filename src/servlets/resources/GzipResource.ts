/**
 * @module GzipResource
 */
import zlib from 'zlib';
import HttpHeaders from '../http/HttpHeaders';
import HttpResource from './HttpResource';
import Resource from './Resource';

export default class GzipResource extends HttpResource {

  private readonly resource: Resource

  constructor(resource: Resource) {
    super(resource.url);
    this.resource = resource;
  }

  getInputStream() {
    const stream = this.resource.getInputStream();
    return stream.pipe(zlib.createGzip());
  }

  getInputRangeStream(start: number, end: number) {
    const stream = this.resource.getInputRangeStream(start, end);
    return stream.pipe(zlib.createGunzip());
  }

  getResponseHeaders() {
    return {
      [HttpHeaders.CONTENT_ENCODING]: 'gzip'
    }
  }
}