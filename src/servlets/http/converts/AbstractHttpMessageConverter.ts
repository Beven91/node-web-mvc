/***
 * @module AbstractHttpMessageConverter
 */

import { JsDataType } from "../../../interface/declare";
import MediaType from "../MediaType";
import ServletContext from "../ServletContext";
import HttpMessageConverter from "./HttpMessageConverter";

export default abstract class AbstractHttpMessageConverter<T> implements HttpMessageConverter<T> {

  private supportedMediaTypes: Array<MediaType>

  constructor(...mediaTypes: Array<MediaType>) {
    this.supportedMediaTypes = new Array<MediaType>();
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

  read(servletContext: ServletContext): Promise<T> {
    return this.readInternal(servletContext);
  }

  async write(data: T, servletContext: ServletContext): Promise<void> {
    await this.writeInternal(data, servletContext);
  }

  abstract supports(clazz: Function): boolean

  abstract readInternal(servletContext: ServletContext): Promise<T>

  abstract writeInternal(data: T, servletContext: ServletContext): Promise<void>
}