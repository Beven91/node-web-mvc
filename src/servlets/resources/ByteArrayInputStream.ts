import { Readable, ReadableOptions } from 'stream';
import fs from 'fs';

export default class ByteArrayInputStream extends Readable {
  private bytesArray: Buffer;

  private pos: number;

  constructor(bytesArray: Buffer, options?: ReadableOptions) {
    super(options);
    this.bytesArray = bytesArray;
    this.pos = 0;
  }

  close() {
    this.bytesArray = null;
  }

  _read(size?: number) {
    if (this.pos >= this.bytesArray.length) {
      this.push(null);
      return;
    }
    const chunk = this.bytesArray.slice(this.pos, this.pos + size);
    this.pos += chunk.length;
    this.push(chunk);
  }
}
