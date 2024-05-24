import type HttpServletRequest from "../HttpServletRequest";
import MediaType from "../MediaType";

export default abstract class AbstractBodyReader {

  private readonly mediaType: MediaType

  constructor(mediaType: MediaType) {
    this.mediaType = mediaType;
  }

  supports(mediaType: MediaType) {
    return this.mediaType.isCompatibleWith(mediaType);
  }

  async read(request: HttpServletRequest, mediaType: MediaType): Promise<Record<string, any>> {
    return this.readInternal(request, mediaType);
  }

  protected abstract readInternal(request: HttpServletRequest, mediaType: MediaType): Promise<Record<string, any>>;
}