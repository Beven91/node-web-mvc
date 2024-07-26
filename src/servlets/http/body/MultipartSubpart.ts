import { randomUUID } from 'crypto';
import MediaType from '../MediaType';
import fs from 'fs';
import path from 'path';
import MultipartFile from '../MultipartFile';
import EntityTooLargeError from '../../../errors/EntityTooLargeError';
import MultipartConfig from '../../config/MultipartConfig';

export type ReadStatus = 'boundary' | 'header' | 'body' | 'after-boundary';

export default class MultipartSubpart {
  public raw: number[];

  public tempRaw: number[];

  public name: string;

  public mediaType: MediaType;

  public filename: string;

  public isFile: boolean;

  public size: number;

  public needTryBoundary: boolean;

  public boundary: string;

  public writter?: fs.WriteStream;

  public headers: Record<string, string>;

  private readonly mediaRoot: string;

  private previousCode: number;

  public status: ReadStatus;

  private maxFileSize: number;

  private chunkSize: number;

  public get currentBuffer() {
    return Buffer.from(this.raw);
  }

  constructor(boundary: string, config: MultipartConfig, raw: number[]) {
    this.boundary = boundary;
    this.headers = {};
    this.raw = raw || [];
    this.tempRaw = [];
    this.size = 0;
    this.status = 'boundary';
    this.mediaRoot = config.mediaRoot;
    this.maxFileSize = Number(config.maxFileSize);
    this.chunkSize = Math.max(8192, boundary.length + 10);
  }

  read(code: number) {
    const raw = this.raw;
    const isCRLF = code == 10 && this.previousCode == 13;
    this.previousCode = code;
    switch (this.status) {
      case 'body':
        if (isCRLF && !this.needTryBoundary) {
          // 在读取subaprt的body时，如果碰到\r\n 则需要进入边界检测
          this.needTryBoundary = true;
          // 移除最后已经读取的\r
          this.tempRaw.pop();
          // 将已经读取内容写出
          this.tryWrite();
          // 返回true 继续读取下个字节
          return true;
        }
        this.tempRaw.push(code);
        if (this.tempRaw.length > this.chunkSize) {
          this.tryWrite();
        }
        // 根据读取进度检查边界
        return this.checkBoundary();
      default:
        raw.push(code);
        // 如果是读取header部分，碰到\r\n则进入下一个内容读取
        if (isCRLF) {
          // 这里需要把最后已经读取的\r\n移除
          raw.pop();
          raw.pop();
        }
        return !isCRLF;
    }
  }

  finish(encoding: BufferEncoding) {
    if (this.writter) {
      this.writter.end();
      const tempPath = this.writter.path.toString();
      this.writter = null;
      return new MultipartFile(this.filename, tempPath, this.mediaType, this.size, this.mediaRoot);
    } else {
      return this.currentBuffer.toString(encoding);
    }
  }

  public clearBuffer() {
    this.raw.length = 0;
  }

  private checkBoundary() {
    const raw = this.tempRaw;
    if (this.needTryBoundary && raw.length == this.boundary.length) {
      this.needTryBoundary = false;
      // 检测是否为结束或者开始boundary
      const str = Buffer.from(raw).toString();
      if (str == this.boundary) {
        // 如果时边界,则返回停止读取，进入结束流程
        return false;
      }
      // 如果不是边界，则需要把\r\n补充
      raw.unshift(10);
      raw.unshift(13);
    }
    // 返回继续读取
    return true;
  }

  private tryWrite() {
    const tempRaw = this.tempRaw;
    if (this.writter) {
      const buffer = Buffer.from(tempRaw);
      this.size = this.size + buffer.length;
      if (this.size > this.maxFileSize) {
        this.writter.end();
        fs.unlinkSync(this.writter.path);
        throw new EntityTooLargeError(this.filename, this.size, this.maxFileSize);
      }
      this.writter.write(buffer);
    } else {
      this.raw.push(...tempRaw);
    }
    this.tempRaw.length = 0;
  }

  private parseContentDisposition(content: string) {
    const segments = content.split(';');
    const info = {} as { filename: string, name: string };
    segments.forEach((segment) => {
      const [ k, v ] = segment.trim().split('=');
      info[k] = v ? v.slice(1, v.length - 1) : '';
    });
    return info;
  }

  public parseSubpartHeader(content: string) {
    if (!content) {
      const tempRoot = path.join(this.mediaRoot, 'tmp-files');
      MultipartFile.ensureDirSync(tempRoot);
      this.writter = this.isFile ? fs.createWriteStream(path.join(tempRoot, randomUUID())) : undefined;
      return false;
    }
    const [ keyName, value ] = content.split(':');
    const key = keyName.trim();
    switch (key.toLowerCase()) {
      case 'content-disposition':
        {
          const s = this.parseContentDisposition(value || '');
          this.name = s.name;
          this.isFile = 'filename' in s;
          this.filename = s.filename;
          this.headers[key] = value;
        }
        break;
      case 'content-type':
        this.mediaType = new MediaType(value?.trim?.());
        this.headers[key] = value;
        break;
      default:
        this.headers[key] = value;
    }
    return true;
  }
}
