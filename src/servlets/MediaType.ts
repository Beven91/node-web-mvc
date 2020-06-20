/**
 * @module MediaType
 * @description 内容类型
 */

declare class Parameters {
  [propName: string]: string
}

export default class MediaType {

  public name: string

  public parameters: Parameters

  constructor(mediaType: string) {
    const parts = (mediaType || '').split(';');
    this.name = parts.shift();
    this.parameters = {};
    parts.forEach((part) => {
      const kv = part.split('=');
      this.parameters[kv[0]] = kv[1];
    });
  }

  toString() {
    const keys = Object.keys(this.parameters);
    return `${this.name};${keys.map((k) => `${k}=${this.parameters[k]}`)}`
  }
}