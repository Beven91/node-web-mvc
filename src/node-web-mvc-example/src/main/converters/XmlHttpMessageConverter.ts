// import { MediaType, ServletContext, HttpMessageConverter } from 'node-web-mvc';

import { HttpMessageConverter, JsDataType, MediaType, ServletContext } from 'node-web-mvc';
import xml2js from 'xml2js';

export default class XmlHttpMessageConverter implements HttpMessageConverter {
  private mediaTypes = [ MediaType.APPLICATION_XML ];

  getSupportedMediaTypes(): MediaType[] {
    return this.mediaTypes;
  }

  /**
   * 判断当前转换器是否能处理当前内容类型
   * @param mediaType 当前内容类型 例如: application/xml
   */
  canRead(dataType: JsDataType, mediaType: MediaType): boolean {
    return !!this.mediaTypes.find((m) => m.isCompatibleWith(mediaType));
  }

  /**
   * 判断当前内容是否能写
   * @param mediaType 当前内容类型 例如: application/xml
   */
  canWrite(dataType: JsDataType, mediaType: MediaType): boolean {
    return !!this.mediaTypes.find((m) => m.isCompatibleWith(mediaType));
  }

  // getSupportedMediaTypes(): Array<string>

  /**
   * 读取当前消息内容
   * @param servletRequest
   */
  async read(servletContext: ServletContext) {
    const buffer = await servletContext.request.readBodyAsBuffer();
    return new Promise((resolve, reject) => {
      xml2js.parseString(buffer.toString('utf8'), (err, data) => {
        err ? reject(err) : resolve(data);
      });
    });
  }

  /**
   * 写出当前内容
   * @param data 当前数据
   * @param mediaType 当前内容类型
   * @param servletContext 当前请求上下文
   */
  async write(data: any, servletContext: ServletContext) {
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(data);
    servletContext.response.fullResponse(xml, MediaType.APPLICATION_XML);
  }
}
