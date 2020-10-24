/**
 * @module MediaType
 * @description 内容类型
 */

declare class Parameters {
  [propName: string]: string
}

export default class MediaType {

  static ALL = new MediaType('*/*')
  static APPLICATION_ATOM_XML = new MediaType("application", "atom+xml");
  static APPLICATION_CBOR = new MediaType("application", "cbor");
  static APPLICATION_FORM_URLENCODED = new MediaType("application", "x-www-form-urlencoded");
  static APPLICATION_JSON = new MediaType("application", "json");
  static APPLICATION_JSON_UTF8 = new MediaType("application", "json", 'utf-8');
  static APPLICATION_OCTET_STREAM = new MediaType("application", "octet-stream");
  static APPLICATION_PDF = new MediaType("application", "pdf");
  static APPLICATION_PROBLEM_JSON = new MediaType("application", "problem+json");
  static APPLICATION_PROBLEM_JSON_UTF8 = new MediaType("application", "problem+json", 'utf-8');
  static APPLICATION_PROBLEM_XML = new MediaType("application", "problem+xml");
  static APPLICATION_RSS_XML = new MediaType("application", "rss+xml");
  static APPLICATION_STREAM_JSON = new MediaType("application", "stream+json");
  static APPLICATION_XHTML_XML = new MediaType("application", "xhtml+xml");
  static APPLICATION_XML = new MediaType("application", "xml");
  static IMAGE_GIF = new MediaType("image", "gif");
  static IMAGE_JPEG = new MediaType("image", "jpeg");
  static IMAGE_PNG = new MediaType("image", "png");
  static MULTIPART_FORM_DATA = new MediaType("multipart", "form-data");
  static MULTIPART_MIXED = new MediaType("multipart", "mixed");
  static MULTIPART_RELATED = new MediaType("multipart", "related");
  static TEXT_EVENT_STREAM = new MediaType("text", "event-stream");
  static TEXT_HTML = new MediaType("text", "html");
  static TEXT_MARKDOWN = new MediaType("text", "markdown");
  static TEXT_PLAIN = new MediaType("text", "plain");
  static TEXT_XML = new MediaType("text", "xml");

  public readonly type: string

  public readonly subtype: string

  public readonly parameters: Parameters

  public get charset() {
    return this.parameters.charset || null;
  }

  public get name() {
    return `${this.type}/${this.subtype}`;
  }

  constructor(mediaType: string, sub?: string, charset?: string) {
    if (arguments.length === 1) {
      const parts = (mediaType || '').split(';');
      const segments = parts.shift().split('/')
      this.type = segments.shift().toLowerCase();
      this.subtype = segments.join('/').toLowerCase();
      this.parameters = {};
      parts.forEach((part) => {
        const kv = part.split('=');
        this.parameters[kv[0]] = kv[1];
      });
    } else {
      this.type = (mediaType || '').toLowerCase();
      this.subtype = (sub || '').toLowerCase();
      this.parameters = charset ? { charset: charset } : {};
    }
  }

  toString() {
    const keys = Object.keys(this.parameters);
    return `${this.name};${keys.map((k) => `${k}=${this.parameters[k]}`)}`
  }
}