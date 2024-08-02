/** *
 * @module AbstractHttpMessageConverter
 */

import { ClazzType, JsDataType } from '../../../interface/declare';
import MediaType from '../MediaType';
import ServletContext from '../ServletContext';
import HttpMessageConverter from './HttpMessageConverter';

export default abstract class AbstractHttpMessageConverter<T> implements HttpMessageConverter<T> {
  private supportedMediaTypes: Array<MediaType>;

  constructor(...mediaTypes: Array<MediaType>) {
    this.supportedMediaTypes = [];
    this.supportedMediaTypes.push(...mediaTypes);
  }

  getSupportedMediaTypes(): MediaType[] {
    return this.supportedMediaTypes;
  }

  private matchMediaType(mediaType: MediaType) {
    if (!mediaType) {
      return true;
    }
    return !!this.supportedMediaTypes.find((m) => m.isCompatibleWith(mediaType));
  }

  canRead(clazz: JsDataType, mediaType: MediaType): boolean {
    return this.supports(clazz) && this.matchMediaType(mediaType);
  }

  canWrite(clazz: JsDataType, mediaType: MediaType): boolean {
    return this.supports(clazz) && this.matchMediaType(mediaType);
  }

  read(servletContext: ServletContext, dataType: Function): Promise<T> {
    return this.readInternal(servletContext, dataType);
  }

  async write(data: T, servletContext: ServletContext): Promise<void> {
    await this.writeInternal(data, servletContext);
  }

  abstract supports(clazz: Function): boolean;

  abstract readInternal(servletContext: ServletContext, dataType: Function): Promise<T>;

  abstract writeInternal(data: T, servletContext: ServletContext): Promise<void>;
}
