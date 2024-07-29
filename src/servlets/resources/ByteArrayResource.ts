import Resource, { InputStream } from './Resource';
import ByteArrayInputStream from './ByteArrayInputStream';

export default class ByteArrayResource extends Resource {
  private readonly byteArray: Buffer;

  public readonly description: string;

  constructor(buffer: Buffer, description?: string) {
    super(null);
    this.byteArray = buffer;
    this.description = description;
  }

  public getByteArray() {
    return this.byteArray;
  }

  get contentLength(): number {
    return this.byteArray.length;
  }

  getInputRangeStream(start: number, end: number): InputStream {
    return new ByteArrayInputStream(this.byteArray.slice(start, end));
  }

  getInputStream() {
    return new ByteArrayInputStream(this.byteArray);
  }
}
