/**
 * @module MultipartFile
 * @description 上传的文件对象
 */
import path from 'path';
import fs from 'fs';
import MediaType from "./MediaType";

export default class MultipartFile {
  /**
   * 当前文件存放的临时位置
   */
  private tempFile: string

  /**
   * 当前文件大小
   */
  public readonly size: number

  /**
   * 判断当前文件内容是否为空
   */
  public get isEmpty() {
    return this.size <= 0;
  }

  /**
   * 文件名称
   */
  public name: string

  /**
   * 当前文件内容编码
   */
  public encoding: string

  /**
   * 当前内容类型
   */
  public mediaType: MediaType

  constructor(name: string, tempFile: string, encoding: string, mediaType: string, size: number) {
    this.mediaType = new MediaType(mediaType);
    this.encoding = encoding;
    this.tempFile = tempFile;
    this.name = name;
    this.size = size;
  }

  /**
   * 将上传的文件保存到指定位置
   */
  async transferTo(dest): Promise<void> {
    // 写出文件
    this.ensureDirSync(path.dirname(dest));
    fs.renameSync(this.tempFile, dest);
  }

  ensureDirSync(dir) {
    if (fs.existsSync(dir)) {
      return;
    }
    const input = path.resolve(dir);
    try {
      fs.mkdirSync(input);
    } catch (ex) {
      this.ensureDirSync(path.dirname(input));
      this.ensureDirSync(input);
    }
  }

  /**
  * 获取当前文件的，为byte[]
  */
  async getBytes() {
    return fs.readFileSync(this.tempFile);
  }

  destory() {
    try {
      if (fs.existsSync(this.tempFile)) {
        fs.unlinkSync(this.tempFile);
      }
    } catch (ex) {
      console.warn(ex);
    }
  }
}