// import { MediaType, ServletContext, HttpMessageConverter } from 'node-web-mvc';

import { HttpMessageConverter } from "../../src";
import MediaType from "../../src/servlets/http/MediaType";
import ServletContext from "../../src/servlets/http/ServletContext";
import RequestWriterStream from '../../src/stream/RequestMemoryStream';
import xml2js from 'xml2js';

export default class XmlHttpMessageConverter implements HttpMessageConverter {
  /**
   * 判断当前转换器是否能处理当前内容类型
   * @param mediaType 当前内容类型 例如: application/xml
   */
  canRead(mediaType: MediaType): boolean {
    return mediaType.name === 'application/xml';
  }

  /**
   * 判断当前内容是否能写
   * @param mediaType 当前内容类型 例如: application/xml
   */
  canWrite(mediaType: MediaType): boolean {
    return mediaType.name === 'application/xml';
  }

  // getSupportedMediaTypes(): Array<string>

  /**
   * 读取当前消息内容
   * @param servletRequest
   */
  read(servletContext: ServletContext, mediaType: MediaType): any {
    return new Promise((resolve, reject) => {
      new RequestWriterStream(servletContext.request, (buffers) => {
        xml2js.parseString(buffers.toString('utf8'), (err, data) => {
          err ? reject(err) : resolve(data);
        });
      });
    })
  }

  /**
   * 写出当前内容
   * @param data 当前数据
   * @param mediaType 当前内容类型
   * @param servletContext 当前请求上下文
   */
  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(data);
      servletContext.response.write(xml, resolve);
    })
  }
}
