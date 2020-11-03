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
  private id: string

  /**
   * 当前文件大小
   */
  private size: number

  /**
   * 是否超出大小限制
   */
  private isOutRange;

  private awaiting: Promise<any>

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

  constructor(name, file, encoding, mediaType) {
    this.mediaType = new MediaType(mediaType);
    this.encoding = encoding;
    this.name = name;
    this.size = 0;
    // 临时文件存放区域
    this.id = path.resolve('app_data/temp-files', Date.now().toString());
    // 确认目标目录是否存在
    this.ensureDirSync(path.dirname(this.id));

    this.awaiting = new Promise((resolve) => {
      // 创建一个写出流
      const writter = fs.createWriteStream(this.id);
      // 读取文件流
      file.on('data', (chunk) => {
        this.size = chunk.length + this.size;
        writter.write(chunk);
      });
      // 如果文件超出限制
      file.on('limit', () => {
        this.isOutRange = true;
        // 结束流
        writter.end();
        // 移除临时文件
        fs.unlinkSync(this.id);
      });
      // 读取完毕
      file.on('end', () => {
        if (!this.isOutRange) {
          writter.end(resolve)
        }
      });
    });
  }

  /**
   * 将上传的文件保存到指定位置
   */
  transferTo(dest) {
    return Promise
      .resolve(this.awaiting)
      .then(() => {
        // 写出文件
        this.ensureDirSync(path.dirname(dest));
        fs.renameSync(this.id, dest);
      })
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
    await Promise.resolve(this.awaiting);
    return fs.readFileSync(this.id);
  }

  destory() {
    try {
      if (fs.existsSync(this.id)) {
        fs.unlinkSync(this.id);
      }
    } catch (ex) {
      console.warn(ex);
    }
  }
}