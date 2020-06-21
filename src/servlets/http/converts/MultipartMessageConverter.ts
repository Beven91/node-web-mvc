/**
 * @module MultipartMessageConverter
 * @description 一个用于处理http请求multipart/类型内容的处理器
 */
import Busboy from 'busboy';
import HttpMessageConverter from './HttpMessageConverter';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import MultipartFile from '../MultipartFile';

export default class JsonMessageConverter implements HttpMessageConverter {

  canRead(mediaType: MediaType) {
    return mediaType.name === 'multipart/form-data';
  }

  canWrite(mediaType: MediaType) {
    return mediaType.name === 'multipart/form-data';
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((resolve) => {
      const form = {};
      const busboy = new Busboy({ headers: servletContext.request.headers }) as any;
      // 提取文件
      busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        form[fieldname] = new MultipartFile(filename, file, encoding, mimetype);
      });
      // 提取字段
      busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        form[fieldname] = val;
      });
      // 读取完毕
      busboy.on('finish', () => resolve(form));
      servletContext.request.pipe(busboy);
    });
  }

  write(data, mediaType: MediaType, servletContext: ServletContext) {
    // 暂不实现写出
  }
}