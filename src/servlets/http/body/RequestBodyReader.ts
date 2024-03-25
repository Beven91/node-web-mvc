import EntityTooLargeError from "../../../errors/EntityTooLargeError";
import type ServletContext from "../ServletContext";
import MultipartBodyReader from "./MultipartBodyReader";
import UrlencodedBodyReader from "./UrlencodedBodyReader";

export default class RequestBodyReader {

  private readonly readers = [
    new MultipartBodyReader(),
    new UrlencodedBodyReader(),
  ]

  read(servletContext: ServletContext): Promise<Record<string, any>> {
    const request = servletContext.request;
    const mediaType = servletContext.request.mediaType;
    const reader = this.readers.find((m) => m.supports(mediaType));
    const configurer = servletContext.configurer;
    const length = request.nativeRequest.readableLength;
    if (!reader) {
      return null;
    }

    if (!isNaN(length) && length > Number(configurer.multipart.maxRequestSize)) {
      // 如果请求超出限制
      return Promise.reject(new EntityTooLargeError());
    }
    if (!request.body) {
      // 如果body还没有开始读
      request.body = reader.read(servletContext);
    }
    return request.body;
  }
}