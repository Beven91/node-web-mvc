
/**
 * @module Resource
 * @description 静态资源对象
 */
import fs from 'fs';
import path from 'path';
import MediaTypeFactory from "../http/MediaFactory";
import { ServerResponse } from 'http';
import { Readable } from 'stream';

export interface InputStream extends Readable {
  close: () => void
}

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

  constructor(filename: string) {
    this.url = filename;
    this.stat = fs.existsSync(filename) ? fs.lstatSync(filename) : null;
  }

  createRelative(relativePath: string) {
    return new Resource(path.join(this.url, relativePath));
  }

  /**
   * 获取当前资源的读取流
   */
  getInputStream(): InputStream {
    return fs.createReadStream(this.url);
  }

  /**
   * 获取当前资源，指定位置的读取流
   * @param start 
   * @param end 
   */
  getInputRangeStream(start: number, end: number): InputStream {
    return fs.createReadStream(this.url, { start, end })
  }

  /**
   * 将资源文件附加到response
   * @param response 原始返回对象
   * @param start 如果是http-ragen则设置开始位置
   * @param end  如果是http-ragen则设置结束位置
   * @returns 
   */
  pipe(response: ServerResponse, start?: number, end?: number) {
    return new Promise((resolve, reject) => {
      const stream = start > 0 ? this.getInputRangeStream(start, end) : this.getInputStream();
      const destory = () => {
        stream.close();
      }
      stream.pipe(response);
      stream.on('end', () => {
        stream.close();
        resolve({});
      });
      stream.on('error', reject);
      response.on('error', destory);
      response.on('close', destory);
    });
  }
}