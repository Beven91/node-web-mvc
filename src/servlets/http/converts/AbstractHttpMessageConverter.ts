/***
 * @module AbstractHttpMessageConverter
 */

import MediaType from "../MediaType";
import ServletContext from "../ServletContext";
import HttpMessageConverter from "./HttpMessageConverter";

export default abstract class AbstractHttpMessageConverter implements HttpMessageConverter {

  private supportedMediaTypes: Array<MediaType>

  constructor(...mediaTypes: Array<MediaType>) {
    this.supportedMediaTypes = new Array<MediaType>();
    this.supportedMediaTypes.push(...mediaTypes);
  }


  canRead(mediaType: MediaType): boolean {
    if (mediaType === null) {
      return true;
    }
    return !!this.supportedMediaTypes.find((m) => {
      if (m.name === '*/*') {
        return true;
      }
      return m.name === mediaType.name
    });
  }

  canWrite(mediaType: MediaType): boolean {
    if (mediaType === null) {
      return true;
    }
    return !!this.supportedMediaTypes.find((m) => {
      if (m.name === '*/*') {
        return true;
      }
      return m.name === mediaType.name
    });
  }

  abstract read(servletContext: ServletContext, mediaType: MediaType)

  abstract write(data: any, mediaType: MediaType, servletContext: ServletContext): Promise<any> 
}