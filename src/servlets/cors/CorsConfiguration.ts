import IllegalArgumentException from "../../errors/IllegalArgumentException"
import { equalsIgnoreCase, isEmpty } from "../util/ApiUtils"

export class BaseCorsOptions {
  origins: string[]

  originPatterns: RegExp[]

  // 跨域允许传递的请求头
  allowedHeaders: string[]

  // 跨域允许返回的返回头
  exposedHeaders: string[]

  // 跨域允许的请求方式
  methods: string[]

  // 跨域允许的认证模式
  allowCredentials: boolean

  allowPrivateNetwork: boolean

  maxAge: number
}


export default class CorsConfiguration extends BaseCorsOptions {

  static ALL = '*'

  constructor(options?: Partial<BaseCorsOptions>) {
    super();
    if (options) {
      this.origins = options.origins;
      this.originPatterns = options.originPatterns;
      this.allowedHeaders = options.allowedHeaders;
      this.exposedHeaders = options.exposedHeaders;
      this.methods = options.methods;
      this.allowCredentials = options.allowCredentials;
      this.allowPrivateNetwork = options.allowPrivateNetwork;
    }
  }

  validate() {
    this.validateAllowCredentials();
    this.validateAllowPrivateNetwork();
  }

  validateAllowCredentials() {
    if (this.allowCredentials == true &&
      this.origins != null && this.origins.indexOf(CorsConfiguration.ALL) > -1) {

      throw new IllegalArgumentException(
        "When allowCredentials is true, allowedOrigins cannot contain the special value \"*\" " +
        "since that cannot be set on the \"Access-Control-Allow-Origin\" response header. " +
        "To allow credentials to a set of origins, list them explicitly " +
        "or consider using \"allowedOriginPatterns\" instead.");
    }
  }

  validateAllowPrivateNetwork() {
    if (this.allowPrivateNetwork == true &&
      this.origins != null && this.origins.indexOf(CorsConfiguration.ALL) > -1) {

      throw new IllegalArgumentException(
        "When allowPrivateNetwork is true, allowedOrigins cannot contain the special value \"*\" " +
        "as it is not recommended from a security perspective. " +
        "To allow private network access to a set of origins, list them explicitly " +
        "or consider using \"allowedOriginPatterns\" instead.");
    }
  }

  private merge(items: any[], from?: any[]) {
    const set = new Set([].concat(items, from).filter(Boolean));
    const elements = [];
    set.forEach((m) => elements.push(m));
    return elements;
  }

  addAllowedOrigin(origin: string) {
    if (origin) {
      origin = origin.replace(/\/$/, '');
      this.origins = this.origins || [];
      this.origins.push(origin);
    }
  }

  addAllowedMethod(method: string) {
    if (method) {
      this.methods = this.methods || [];
      this.methods.push(method);
    }
  }

  addAllowedHeader(header: string) {
    if (header) {
      this.allowedHeaders = this.allowedHeaders || [];
      this.allowedHeaders.push(header);
    }
  }

  addAllowedOriginPattern(pattern: RegExp) {
    if (pattern) {
      this.originPatterns = this.originPatterns || [];
      this.originPatterns.push(pattern);
    }
  }

  combine(other: CorsConfiguration) {
    if (!other) {
      return this;
    }
    const config = new CorsConfiguration();
    config.origins = this.merge(this.origins, other.origins);
    config.originPatterns = this.merge(this.originPatterns, other.originPatterns);
    config.allowedHeaders = this.merge(this.allowedHeaders, other.allowedHeaders);
    config.exposedHeaders = this.merge(this.exposedHeaders, other.exposedHeaders);
    config.methods = this.merge(this.methods, other.methods);
    if (!isEmpty(this.allowCredentials)) {
      config.allowCredentials = this.allowCredentials;
    }
    if (!isEmpty(this.allowPrivateNetwork)) {
      config.allowPrivateNetwork = this.allowPrivateNetwork;
    }
    if (!isEmpty(this.maxAge)) {
      config.maxAge = this.maxAge;
    }
    return config;
  }

  private matchOrigin(checkOrigin: string) {
    return this.origins?.find?.((m) => equalsIgnoreCase(m, checkOrigin) || m === CorsConfiguration.ALL);
  }

  private matchOriginWithPattern(checkOrigin: string) {
    return this.originPatterns?.find?.((m) => m.test(checkOrigin));
  }

  checkOrigin(origin: string) {
    if (isEmpty(origin)) {
      return null;
    }
    const ALL = CorsConfiguration.ALL;
    const checkOrigin = origin.replace(/\/$/, '');
    const matcedhOrigin = this.matchOrigin(checkOrigin) || this.matchOriginWithPattern(checkOrigin);
    if (matcedhOrigin == ALL) {
      this.validate();
      return ALL;
    } else if (matcedhOrigin) {
      return origin;
    }
    return null;
  }

  checkHttpMethod(requestMethod: string) {
    if (isEmpty(requestMethod)) {
      return null;
    }
    if (this.methods?.length < 1) {
      return [requestMethod];
    }
    const matched = this.methods.find((m) => equalsIgnoreCase(m, requestMethod));
    if (matched) {
      return this.methods;
    }
  }

  checkHeaders(requestHeaders: string[]) {
    if (requestHeaders == null) {
      return null;
    }
    if (requestHeaders.length < 1) {
      return [];
    }
    if (this.allowedHeaders?.length < 1) {
      return null;
    }
    const allowHeaders = this.allowedHeaders;
    if (allowHeaders.indexOf(CorsConfiguration.ALL) > -1) {
      return [].concat(requestHeaders);
    }
    const headers = requestHeaders.filter((m) => {
      return !!allowHeaders.find((a) => equalsIgnoreCase(m, a))
    })

    return headers.length < 1 ? null : headers;
  }

  applyPermitDefaultValues() {
    const ALL = CorsConfiguration.ALL;
    if (this.origins == null) {
      this.origins = [ALL];
    }
    if (this.allowedHeaders == null) {
      this.allowedHeaders = [
        ALL
      ]
    }
    if (this.maxAge == null) {
      this.maxAge = 1800;
    }
    return this;
  }
}