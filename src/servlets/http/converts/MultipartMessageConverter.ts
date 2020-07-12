/**
 * @module MultipartMessageConverter
 * @description 一个用于处理http请求格式为multipart/类型内容的处理器
 */
import Busboy from 'busboy';
import HttpMessageConverter from './HttpMessageConverter';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import MultipartFile from '../MultipartFile';
import EntityTooLargeError from '../../../errors/EntityTooLargeError';

export default class MultipartMessageConverter implements HttpMessageConverter {

  canRead(mediaType: MediaType) {
    return mediaType.name === 'multipart/form-data';
  }

  canWrite(mediaType: MediaType) {
    return mediaType.name === 'multipart/form-data';
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
  createMultipartFile(form, fieldname, file, filename, encoding, mimetype): Promise<any> {
    return new Promise((resolve, reject) => {
      // 将数据添加form上
      const value = form[fieldname];
      if (value) {
        form[fieldname] = [
          value,
          new MultipartFile(filename, file, encoding, mimetype)
        ];
      } else {
        form[fieldname] = new MultipartFile(filename, file, encoding, mimetype);
      }
      // 如果超过最大限制，则抛出异常
      file.on('limit', () => reject(new EntityTooLargeError()));
      // 常规读取文件完毕
      file.on('end', resolve);
    })
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((topResolve, topReject) => {
      let promise = Promise.resolve();
      const form = {};
      const configurer = servletContext.configurer;
      const busboy: any = new Busboy({
        headers: servletContext.request.headers,
        limits: {
          fileSize: configurer.multipart.maxFileSize as number
        }
      });
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        // 提取文件
        promise = promise.then(() => this.createMultipartFile(form, fieldname, file, filename, encoding, mimetype));
      });
      busboy.on('field', function (fieldname, val) {
        // 提取字段
        promise = promise.then(() => form[fieldname] = val);
      });
      // 读取完毕
      busboy.on('finish', () => promise.then(() => topResolve(form), topReject));
      // 托管到busboy读取
      servletContext.request.pipe(busboy);
    });
  }

  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    // 暂不实现写出
    return Promise.resolve();
  }
}