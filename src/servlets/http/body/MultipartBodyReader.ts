/**
 * @module MultipartMessageConverter
 * @description 一个用于处理http请求格式为multipart/类型内容的处理器
 */
import path from 'path';
import fs from 'fs';
import Busboy from 'busboy';
import type ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import MultipartFile from '../MultipartFile';
import EntityTooLargeError from '../../../errors/EntityTooLargeError';
import { randomUUID } from 'crypto';
import AbstractBodyReader from './AbstractBodyReader';
import type { Multipart } from '../../config/WebAppConfigurerOptions';

export default class MultipartBodyReader extends AbstractBodyReader {

  private multipart: Multipart

  constructor(config: Multipart) {
    super(MediaType.MULTIPART_FORM_DATA)
    this.multipart = config;
  }

  ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 根据上传的文件创建MultipartFile
   * @param {Object} form 当前表单对象
   * @param {String} fieldname 字段名
   * @param {String} file 上传的文件对象
   * @param {String} filename 上传文件的原始名称
   * @param {String} encoding 文件内容编码
   * @param {String} mimetype 内容类型
   */
  createMultipartFile(form, fieldname, file, filename, encoding, mimetype, servletContext: ServletContext): Promise<void> {
    return new Promise((resolve, reject) => {
      // 将数据添加form上
      const meta = { size: 0, isOutRange: false };
      const value = form[fieldname];
      const root = this.multipart?.tempRoot || 'app_data/temp-files';
      const id = path.join(root, randomUUID());
      this.ensureDir(root);
      // 创建一个写出流
      const writter = fs.createWriteStream(id);
      // 读取文件流
      file.on('data', (chunk) => {
        meta.size = chunk.length + meta.size;
        writter.write(chunk);
      });
      // 如果文件超出限制
      file.on('limit', () => {
        meta.isOutRange = true;
        // 结束流
        writter.end();
        // 移除临时文件
        fs.unlinkSync(id);
        // 如果超过最大限制，则抛出异常
        reject(new EntityTooLargeError(fieldname, meta.size, this.multipart.maxFileSize));
      });
      // 读取完毕
      file.on('end', () => {
        if (meta.isOutRange) return;
        writter.end(() => {
          const multipartFile = new MultipartFile(filename, id, encoding, mimetype, meta.size);
          if (value) {
            form[fieldname] = [value, multipartFile];
          } else {
            form[fieldname] = multipartFile;
          }
          servletContext.addReleaseQueue(() => multipartFile.destory());
          resolve();
        })
      });
    })
  }

  readInternal(servletContext: ServletContext) {
    return new Promise((topResolve, topReject) => {
      let promise = Promise.resolve();
      const form = {};
      const busboy: any = new Busboy({
        headers: servletContext.request.headers,
        limits: {
          fileSize: this.multipart.maxFileSize as number
        }
      });
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        // 提取文件
        promise = promise.then(() => this.createMultipartFile(form, fieldname, file, filename, encoding, mimetype, servletContext));
      });
      busboy.on('field', function (fieldname, val) {
        // 提取字段
        promise = promise.then(() => {
          if (fieldname in form) {
            // 如果是多个值
            form[fieldname] = [form[fieldname]];
            form[fieldname].push(val);
            return;
          }
          form[fieldname] = val;
        });
      });
      // 读取完毕
      busboy.on('finish', () => {
        promise.then(() => topResolve(form), topReject)
      });
      // 托管到busboy读取
      servletContext.request.pipe(busboy);
    });
  }
}