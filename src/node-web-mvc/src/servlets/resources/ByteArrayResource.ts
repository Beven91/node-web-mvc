import Resource, { InputStream } from './Resource';
import ByteArrayInputStream from './ByteArrayInputStream';
import MediaType from '../http/MediaType';

export default class ByteArrayResource extends Resource {
  private readonly byteArray: Buffer;

  public readonly description: string;

  private readonly mimeType: MediaType;

  constructor(buffer: Buffer, mediaType?: MediaType, description?: string) {
    super(null);
    this.byteArray = buffer;
    this.mimeType = mediaType;
    this.description = description;
  }

  public getByteArray() {
    return this.byteArray;
  }

  get contentLength(): number {
    return this.byteArray.length;
  }

  get mediaType(): MediaType {
    return this.mimeType;
  }

  getInputRangeStream(start: number, end: number): InputStream {
    return new ByteArrayInputStream(this.byteArray.slice(start, end));
  }

  getInputStream() {
    return new ByteArrayInputStream(this.byteArray);
  }
}
