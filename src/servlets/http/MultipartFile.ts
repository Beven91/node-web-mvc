/**
 * @module MultipartFile
 * @description 上传的文件对象
 */
import path from 'path';
import fs from 'fs-extra';
import MediaType from "./MediaType";

export default class MultipartFile {

  /**
   * 当前文件存放的临时位置
   */
  private id: string

  private awaiting: Promise<any>

  /**
   * 当前文件是否已经读取完毕
   */
  private isReadEnd: boolean

  /**
   * 一个回调队列，在读取完成客户端传递的文件流后触发
   */
  private endQueues: Array<Function>

  /**
   * 判断当前文件内容是否为空
   */
  public get isEmpty() {
    return false;
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
    this.endQueues = [];
    // 临时文件存放区域
    this.id = path.resolve('app_data/temp-files', Date.now().toString());
    // 确认目标目录是否存在
    fs.ensureDir(path.dirname(this.id));

    this.awaiting = new Promise((resolve) => {
      // 创建一个写出流
      const writter = fs.createWriteStream(this.id);
      // 读取文件流
      file.on('data', (chunk) => {
        writter.write(chunk);
      });
      // 读取完毕
      file.on('end', () => {
        writter.end(resolve)
      })
    });
  }

  /**
   * 将上传的文件保存到指定位置
   */
  async saveAs(dest) {
    // 等待读取完毕
    await Promise.resolve(this.awaiting);
    // 写出文件
    fs.ensureDir(path.dirname(dest));
    fs.renameSync(this.id, dest);
  }

  /**
  * 获取当前文件的，为byte[]
  */
  async getBytes() {
    await Promise.resolve(this.awaiting);
    return fs.readFileSync(this.id);
  }
}