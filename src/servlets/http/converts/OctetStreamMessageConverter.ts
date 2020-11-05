/**
 * @module OctetStreamMessageConverter
 * @description 用于返回文件流，以及文件下载支持
 */
import fs from 'fs';
import ServletContext from '../ServletContext';
import MediaType from '../MediaType';
import AbstractHttpMessageConverter from './AbstractHttpMessageConverter';

export default class OctetStreamMessageConverter extends AbstractHttpMessageConverter {

  constructor() {
    super(new MediaType('application/octet-stream'))
  }

  read(servletContext: ServletContext, mediaType: MediaType) {

  }

  write(stream: fs.ReadStream, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve, reject) => {
      if (stream) {
        // const start = Date.now();
        stream.pipe(servletContext.response.nativeResponse);
        stream.on('error', reject);
        stream.on('end', resolve);
      } else {
        resolve();
      }
    });
  }
}