import EntityTooLargeError from "../../../errors/EntityTooLargeError";
import type { Multipart } from "../../config/WebAppConfigurerOptions";
import type ServletContext from "../ServletContext";
import AbstractBodyReader from "./AbstractBodyReader";
import MultipartBodyReader from "./MultipartBodyReader";
import UrlencodedBodyReader from "./UrlencodedBodyReader";

export default class RequestBodyReader {

  private config: Multipart

  private readonly readers: AbstractBodyReader[]

  constructor(config: Multipart) {
    this.config = config;
    this.readers = [
      new MultipartBodyReader(config),
      new UrlencodedBodyReader(),
    ]
  }

  read(servletContext: ServletContext): Promise<Record<string, any>> {
    const request = servletContext.request;
    const mediaType = servletContext.request.mediaType;
    const reader = this.readers.find((m) => m.supports(mediaType));
    const length = request.nativeRequest.readableLength;
    if (!reader) {
      return null;
    }

    if (!isNaN(length) && length > Number(this.config.maxRequestSize)) {
      // 如果请求超出限制
      return Promise.reject(new EntityTooLargeError('request.body', length, this.config.maxRequestSize));
    }
    if (!request.body) {
      // 如果body还没有开始读
      request.body = reader.read(servletContext);
    }
    return request.body;
  }
}