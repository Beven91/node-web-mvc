/**
 * @module MultipartFile
 * @description 上传的文件对象
 */
import path from 'path';
import fs from 'fs';
import MediaType from "./MediaType";
import IllegalArgumentException from '../../errors/IllegalArgumentException';

const normalizePath = (source: string)=> source.replace(/\\/g,'/');

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
   * 当前内容类型
   */
  public mediaType: MediaType

  private readonly dir: string

  constructor(name: string, tempFile: string, mediaType: MediaType, size: number, dir: string) {
    this.mediaType = mediaType;
    this.tempFile = tempFile;
    this.name = name;
    this.size = size;
    this.dir = dir;
  }

  private validatePath(file: string) {
    file = normalizePath(path.normalize(file));
    const cwd = normalizePath(process.cwd());
    if (file.indexOf(cwd) > -1 && file.indexOf(this.dir) < 0) {
      // 非法写入
      throw new IllegalArgumentException('Illegal write path: ' + file);
    }
  }

  /**
   * 将上传的文件保存到指定位置
   */
  async transferTo(dest): Promise<void> {
    if (!path.isAbsolute(dest)) {
      dest = path.join(this.dir, dest);
    }
    this.validatePath(dest);
    MultipartFile.ensureDirSync(path.dirname(dest));
    // 写出文件
    fs.renameSync(this.tempFile, dest);
  }

  static ensureDirSync(dir) {
    if (fs.existsSync(dir)) {
      return;
    }
    fs.mkdirSync(dir, { recursive: true })
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