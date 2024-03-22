/**
 * @module MediaType
 * @description 内容类型
 */

declare class Parameters {
  [propName: string]: string
}

export default class MediaType {

  static ALL = new MediaType('*', '*')
  static APPLICATION_ATOM_XML = new MediaType("application", "atom+xml");
  static APPLICATION_CBOR = new MediaType("application", "cbor");
  static APPLICATION_FORM_URLENCODED = new MediaType("application", "x-www-form-urlencoded");
  static APPLICATION_JSON = new MediaType("application", "json");
  static APPLICATION_JSON_UTF8 = new MediaType("application", "json", { charset: 'utf-8' });
  static APPLICATION_OCTET_STREAM = new MediaType("application", "octet-stream");
  static APPLICATION_PDF = new MediaType("application", "pdf");
  static APPLICATION_PROBLEM_JSON = new MediaType("application", "problem+json");
  static APPLICATION_PROBLEM_JSON_UTF8 = new MediaType("application", "problem+json", { charset: 'utf-8' });
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

  public get isWildcardType() {
    return this.type === "*";
  }

  public get isWildcardSubtype() {
    return this.subtype[0] === "*";
  }

  public get subTypeSuffix() {
    return this.subtype.split('+').pop();
  }

  public get isConcrete() {
    return !this.isWildcardType && !this.isWildcardSubtype;
  }

  public isPresentIn(mimeTypes: MediaType[]) {
    return mimeTypes.find((m) => m.type.toLowerCase() == this.type.toLowerCase() && m.subtype.toLowerCase() == this.subtype.toLowerCase());
  }

  public isCompatibleWith(other: MediaType) {
    const thisSuffix = this.subTypeSuffix;
    const otherSuffix = other.subTypeSuffix;
    if (!other) {
      return false;
    } else if (this.isWildcardType || other.isWildcardType) {
      // 如果是类型通配符，则返回 true
      return true;
    } else if (this.type != other.type) {
      // 如果主类型不匹配，则返回false
      return false;
    } else if (this.subtype == other.subtype) {
      // 如果完全匹配，返回 true
      return true;
    } else if (this.subtype === '*' || other.subtype === '*') {
      // 在主类型匹配下，如果子类型是通配符，则返回 true
      return true;
    } else if (this.isWildcardSubtype && thisSuffix) {
      return thisSuffix == other.subtype || thisSuffix == otherSuffix;
    } else if (other.isWildcardSubtype && otherSuffix) {
      return otherSuffix == this.subtype || otherSuffix == thisSuffix;
    } else {
      return false;
    }
  }

  constructor(mediaType: string, sub?: string, parameters?: Parameters) {
    if (arguments.length === 1) {
      const parts = (mediaType || '').split(';');
      const segments = parts.shift().split('/')
      this.type = segments.shift().toLowerCase().trim();
      this.subtype = segments.join('/').toLowerCase().trim();
      this.parameters = {};
      parts.forEach((part) => {
        const kv = part.split('=');
        this.parameters[kv[0]] = kv[1];
      });
    } else {
      this.type = (mediaType || '').toLowerCase().trim();
      this.subtype = (sub || '').toLowerCase().trim();
      this.parameters = parameters || {};
    }
  }

  toString() {
    const keys = Object.keys(this.parameters || {});
    const joinChar = keys?.length > 0 ? ';' : '';
    return `${this.name}${joinChar}${keys.map((k) => `${k}=${this.parameters[k]}`)}`
  }

  copyQualityValue(mediaType: MediaType) {
    if (mediaType.parameters['q']) {
      // 复制质量因子
      const parameters = {};
      Object.keys(this.parameters).forEach((k) => {
        parameters[k] = this.parameters[k];
      })
      parameters['q'] = mediaType.parameters['q'];
      return new MediaType(this.type, this.subtype, parameters)
    }
    return this;
  }

  public static specificityCompare(mediaType1: MediaType, mediaType2: MediaType) {
    if (mediaType1.isWildcardType && !mediaType2.isWildcardType) {
      return 1;
    } else if (mediaType2.isWildcardType && !mediaType1.isWildcardType) {
      return -1;
    } else if (mediaType1.type != mediaType2.type) {
      return 0;
    } else if (mediaType1.isWildcardSubtype && !mediaType2.isWildcardSubtype) {
      return 1;
    } else if (mediaType2.isWildcardSubtype && !mediaType1.isWildcardSubtype) {
      return -1;
    } else if (mediaType1.subtype !== mediaType2.subtype) {
      return 0;
    }
    const size1 = Object.keys(mediaType1.parameters || {}).length;
    const size2 = Object.keys(mediaType2.parameters || {}).length;
    return size2 - size1;
  }

}