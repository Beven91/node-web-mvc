/**
 * @module MessageConverter
 * @description 内容转换器
 */
import MediaType from '../MediaType';
import ServletContext from '../ServletContext';
import HttpMessageConverter from './HttpMessageConverter';
import JsonMessageConverter from './JsonMessageConverter';
import DefaultMessageConverter from './DefaultMessageConverter';
import MultipartMessageConverter from './MultipartMessageConverter';
import UrlencodedMessageConverter from './UrlencodedMessageConverter';
import EntityTooLargeError from '../../../errors/EntityTooLargeError';
import OctetStreamMessageConverter from './OctetStreamMessageConverter';
import hot from 'nodejs-hmr';

export default class MessageConverter {

  private readonly registerConverters: Array<HttpMessageConverter>

  constructor() {
    this.registerConverters = [
      new JsonMessageConverter(),
      new UrlencodedMessageConverter(),
      new MultipartMessageConverter(),
      new OctetStreamMessageConverter(),
      new DefaultMessageConverter(),
    ]
    // 热更新
    acceptHot(this.registerConverters);
  }

  /**
   * 注册一个消息转换器
   * @param servletContext 
   */
  addMessageConverters(converter: HttpMessageConverter) {
    this.registerConverters.unshift(converter);
  }

  /**
   * 当前当前http的内容
   */
  read(servletContext: ServletContext): Promise<any> {
    const request = servletContext.request;
    const configurer = servletContext.configurer;
    const length = request.nativeRequest.readableLength;
    if (!isNaN(length) && length > Number(configurer.multipart.maxRequestSize)) {
      // 如果请求超出限制
      return Promise.reject(new EntityTooLargeError());
    }
    if (request.body) {
      // 如果body已经读取，或者正在读取中
      return Promise.resolve(request.body);
    }
    const mediaType = servletContext.request.mediaType;
    const converter = this.registerConverters.find((converter) => converter.canRead(mediaType));
    return request.body = Promise.resolve(converter.read(servletContext, mediaType));
  }

  /**
   * 写出内容到response中
   */
  write(body: any, mediaType: MediaType, servletContext: ServletContext): Promise<any> {
    return new Promise((resolve) => {
      Promise.resolve(body).then((data) => {
        const dataType = body?.constructor;
        const converter = this.registerConverters.find((converter) => converter.canWrite(dataType, mediaType));
        return resolve(converter.write(data, mediaType, servletContext));
      })
    })
  }
}

function acceptHot(registerConverters) {
  hot
    .create(module)
    .clean()
    .postend((now, old) => {
      hot.createHotUpdater(registerConverters, now, old).update();
    });
}