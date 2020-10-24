/**
 * @module GzipResource
 */
import zlib from 'zlib';
import Resource from "./Resource";

export default class GzipResource extends Resource {

  getInputStream() {
    const stream = super.getInputStream();
    return stream.pipe(zlib.createGzip());
  }

  getInputRangeStream(start: number, end: number) {
    const stream = super.getInputRangeStream(start, end);
    return stream.pipe(zlib.createGunzip());
  }
}