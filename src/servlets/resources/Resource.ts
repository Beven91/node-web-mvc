
/**
 * @module Resource
 * @description 静态资源对象
 */
import fs from 'fs';
import path from 'path';
import { Stream } from 'stream';
import MediaTypeFactory from "../http/MediaFactory";

export default class Resource {

  readonly stat: fs.Stats

  /**
   * 获取当前文件明
   */
  readonly url: string

  /**
   * 当前资源内容长度
   */
  get contentLength() {
    return this.stat ? this.stat.size : null;
  }

  /**
   * 最后修改时间
   */
  get lastModified() {
    return this.stat ? this.stat.mtime.getTime() : null;
  }

  /**
   * 获取当前文件的mediaType
   */
  get mediaType() {
    return MediaTypeFactory.getMediaType(this.url);
  }

  get isReadable() {
    return !!this.stat && this.stat.isFile();
  }

  constructor(filename) {
    this.url = filename;
    this.stat = fs.existsSync(filename) ? fs.lstatSync(filename) : null;
  }

  createRelative(relativePath: string) {
    return new Resource(path.join(this.url, relativePath));
  }

  /**
   * 获取当前资源的读取流
   */
  getInputStream(): Stream {
    return fs.createReadStream(this.url);
  }

  /**
   * 获取当前资源，指定位置的读取流
   * @param start 
   * @param end 
   */
  getInputRangeStream(start, end): Stream {
    return fs.createReadStream(this.url, { start, end })
  }
}