import MediaType from "../MediaType";
import type ServletContext from "../ServletContext";

export default abstract class AbstractBodyReader {

  private readonly mediaType: MediaType

  constructor(mediaType: MediaType) {
    this.mediaType = mediaType;
  }

  supports(mediaType: MediaType) {
    return this.mediaType.isCompatibleWith(mediaType);
  }

  async read(servletContext: ServletContext): Promise<Record<string, any>> {
    return this.readInternal(servletContext);
  }

  protected abstract readInternal(servletContext: ServletContext): Promise<Record<string, any>>;
}