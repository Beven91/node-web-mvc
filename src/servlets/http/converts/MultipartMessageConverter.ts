/**
 * @module MultipartMessageConverter
 * @description 一个用于处理http请求multipart/类型内容的处理器
 */
import Busboy from 'busboy';
import HttpMessageConverter from './HttpMessageConverter';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';

export default class JsonMessageConverter implements HttpMessageConverter {

  canRead(mediaType: MediaType) {
    return mediaType.name === 'multipart/form-data';
  }

  canWrite(mediaType: MediaType) {
    return mediaType.name === 'multipart/form-data';
  }

  read(servletContext: ServletContext, mediaType: MediaType) {
    return new Promise((resolve, reject) => {
      const busboy = new Busboy({ headers: servletContext.request.headers }) as any;
      busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
        file.on('data', function (data) {
          console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
        });
        file.on('end', function () {
          console.log('File [' + fieldname + '] Finished');
        });
      });
      busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      });
      busboy.on('finish', resolve);
    });
  }

  write(data, mediaType: MediaType, servletContext: ServletContext) {
  }
}