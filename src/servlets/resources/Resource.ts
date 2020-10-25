
/**
 * @module Resource
 * @description 静态资源对象
 */
import fs from 'fs';
import { Stream } from 'stream';
import MediaTypeFactory from "../http/MediaFactory";

export default class Resource {

  private stat: fs.Stats

  /**
   * 获取当前文件明
   */
  readonly filename

  /**
   * 当前资源内容长度
   */
  get contentLength() {
    return this.stat.size;
  }

  /**
   * 最后修改时间
   */
  get lastModified() {
    return this.stat.mtime.getTime();
  }

  /**
   * 获取当前文件的mediaType
   */
  get mediaType() {
    return MediaTypeFactory.getMediaType(this.filename);
  }

  constructor(filename) {
    this.filename = filename;
    this.stat = fs.lstatSync(filename);
  }

  /**
   * 获取当前资源的读取流
   */
  getInputStream(): Stream {
    return fs.createReadStream(this.filename);
  }

  /**
   * 获取当前资源，指定位置的读取流
   * @param start 
   * @param end 
   */
  getInputRangeStream(start, end): Stream {
    return fs.createReadStream(this.filename, { start, end })
  }
}