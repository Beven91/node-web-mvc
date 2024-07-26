
export default class HttpHeaders {
  /**
   * The HTTP {@code Accept} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.2">Section 5.3.2 of RFC 7231</a>
   */
  static readonly ACCEPT = 'Accept';
  /**
   * The HTTP {@code Accept-Charset} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.3">Section 5.3.3 of RFC 7231</a>
   */
  static readonly ACCEPT_CHARSET = 'Accept-Charset';
  /**
   * The HTTP {@code Accept-Encoding} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.4">Section 5.3.4 of RFC 7231</a>
   */
  static readonly ACCEPT_ENCODING = 'Accept-Encoding';
  /**
   * The HTTP {@code Accept-Language} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.3.5">Section 5.3.5 of RFC 7231</a>
   */
  static readonly ACCEPT_LANGUAGE = 'Accept-Language';
  /**
   * The HTTP {@code Accept-Ranges} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7233#section-2.3">Section 5.3.5 of RFC 7233</a>
   */
  static readonly ACCEPT_RANGES = 'Accept-Ranges';
  /**
   * The CORS {@code Access-Control-Allow-Credentials} response header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials';
  /**
   * The CORS {@code Access-Control-Allow-Headers} response header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_ALLOW_HEADERS = 'Access-Control-Allow-Headers';
  /**
   * The CORS {@code Access-Control-Allow-Methods} response header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_ALLOW_METHODS = 'Access-Control-Allow-Methods';
  /**
   * The CORS {@code Access-Control-Allow-Origin} response header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
  /**
   * The CORS {@code Access-Control-Expose-Headers} response header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';

  static readonly ACCESS_CONTROL_ALLOW_PRIVATE_NETWORK ='Access-Control-Allow-Private-Network';

  /**
   * The CORS {@code Access-Control-Max-Age} response header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_MAX_AGE = 'Access-Control-Max-Age';
  /**
   * The CORS {@code Access-Control-Request-Headers} request header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_REQUEST_HEADERS = 'Access-Control-Request-Headers';
  /**
   * The CORS {@code Access-Control-Request-Method} request header field name.
   * @see <a href="https://www.w3.org/TR/cors/">CORS W3C recommendation</a>
   */
  static readonly ACCESS_CONTROL_REQUEST_METHOD = 'Access-Control-Request-Method';
  /**
   * The HTTP {@code Age} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.1">Section 5.1 of RFC 7234</a>
   */
  static readonly AGE = 'Age';
  /**
   * The HTTP {@code Allow} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.4.1">Section 7.4.1 of RFC 7231</a>
   */
  static readonly ALLOW = 'Allow';
  /**
   * The HTTP {@code Authorization} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.2">Section 4.2 of RFC 7235</a>
   */
  static readonly AUTHORIZATION = 'Authorization';
  /**
   * The HTTP {@code Cache-Control} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.2">Section 5.2 of RFC 7234</a>
   */
  static readonly CACHE_CONTROL = 'Cache-Control';
  /**
   * The HTTP {@code Connection} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-6.1">Section 6.1 of RFC 7230</a>
   */
  static readonly CONNECTION = 'Connection';
  /**
   * The HTTP {@code Content-Encoding} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.2.2">Section 3.1.2.2 of RFC 7231</a>
   */
  static readonly CONTENT_ENCODING = 'Content-Encoding';
  /**
   * The HTTP {@code Content-Disposition} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc6266">RFC 6266</a>
   */
  static readonly CONTENT_DISPOSITION = 'Content-Disposition';
  /**
   * The HTTP {@code Content-Language} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.3.2">Section 3.1.3.2 of RFC 7231</a>
   */
  static readonly CONTENT_LANGUAGE = 'Content-Language';
  /**
   * The HTTP {@code Content-Length} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-3.3.2">Section 3.3.2 of RFC 7230</a>
   */
  static readonly CONTENT_LENGTH = 'Content-Length';
  /**
   * The HTTP {@code Content-Location} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.4.2">Section 3.1.4.2 of RFC 7231</a>
   */
  static readonly CONTENT_LOCATION = 'Content-Location';
  /**
   * The HTTP {@code Content-Range} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7233#section-4.2">Section 4.2 of RFC 7233</a>
   */
  static readonly CONTENT_RANGE = 'Content-Range';
  /**
   * The HTTP {@code Content-Type} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-3.1.1.5">Section 3.1.1.5 of RFC 7231</a>
   */
  static readonly CONTENT_TYPE = 'Content-Type';
  /**
   * The HTTP {@code Cookie} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc2109#section-4.3.4">Section 4.3.4 of RFC 2109</a>
   */
  static readonly COOKIE = 'Cookie';
  /**
   * The HTTP {@code Date} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.1.2">Section 7.1.1.2 of RFC 7231</a>
   */
  static readonly DATE = 'Date';
  /**
   * The HTTP {@code ETag} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-2.3">Section 2.3 of RFC 7232</a>
   */
  static readonly ETAG = 'ETag';
  /**
   * The HTTP {@code Expect} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.1.1">Section 5.1.1 of RFC 7231</a>
   */
  static readonly EXPECT = 'Expect';
  /**
   * The HTTP {@code Expires} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.3">Section 5.3 of RFC 7234</a>
   */
  static readonly EXPIRES = 'Expires';
  /**
   * The HTTP {@code From} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.5.1">Section 5.5.1 of RFC 7231</a>
   */
  static readonly FROM = 'From';
  /**
   * The HTTP {@code Host} header field name.
   * @see <a href="htLatps://tools.ietf.org/html/rfc7230#section-5.4">Section 5.4 of RFC 7230</a>
   */
  static readonly HOST = 'Host';
  /**
   * The HTTP {@code If-Match} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.1">Section 3.1 of RFC 7232</a>
   */
  static readonly IF_MATCH = 'If-Match';
  /**
   * The HTTP {@code If-Modified-Since} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.3">Section 3.3 of RFC 7232</a>
   */
  static readonly IF_MODIFIED_SINCE = 'If-Modified-Since';
  /**
   * The HTTP {@code If-None-Match} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.2">Section 3.2 of RFC 7232</a>
   */
  static readonly IF_NONE_MATCH = 'If-None-Match';
  /**
   * The HTTP {@code If-Range} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7233#section-3.2">Section 3.2 of RFC 7233</a>
   */
  static readonly IF_RANGE = 'If-Range';
  /**
   * The HTTP {@code If-Unmodified-Since} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-3.4">Section 3.4 of RFC 7232</a>
   */
  static readonly IF_UNMODIFIED_SINCE = 'If-Unmodified-Since';
  /**
   * The HTTP {@code Last-Modified} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-2.2">Section 2.2 of RFC 7232</a>
   */
  static readonly LAST_MODIFIED = 'Last-Modified';
  /**
   * The HTTP {@code Link} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc5988">RFC 5988</a>
   */
  static readonly LINK = 'Link';
  /**
   * The HTTP {@code Location} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.2">Section 7.1.2 of RFC 7231</a>
   */
  static readonly LOCATION = 'Location';
  /**
   * The HTTP {@code Max-Forwards} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.1.2">Section 5.1.2 of RFC 7231</a>
   */
  static readonly MAX_FORWARDS = 'Max-Forwards';
  /**
   * The HTTP {@code Origin} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc6454">RFC 6454</a>
   */
  static readonly ORIGIN = 'Origin';
  /**
   * The HTTP {@code Pragma} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.4">Section 5.4 of RFC 7234</a>
   */
  static readonly PRAGMA = 'Pragma';
  /**
   * The HTTP {@code Proxy-Authenticate} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.3">Section 4.3 of RFC 7235</a>
   */
  static readonly PROXY_AUTHENTICATE = 'Proxy-Authenticate';
  /**
   * The HTTP {@code Proxy-Authorization} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.4">Section 4.4 of RFC 7235</a>
   */
  static readonly PROXY_AUTHORIZATION = 'Proxy-Authorization';
  /**
   * The HTTP {@code Range} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7233#section-3.1">Section 3.1 of RFC 7233</a>
   */
  static readonly RANGE = 'Range';
  /**
   * The HTTP {@code Referer} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.5.2">Section 5.5.2 of RFC 7231</a>
   */
  static readonly REFERER = 'Referer';
  /**
   * The HTTP {@code Retry-After} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.3">Section 7.1.3 of RFC 7231</a>
   */
  static readonly RETRY_AFTER = 'Retry-After';
  /**
   * The HTTP {@code Server} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.4.2">Section 7.4.2 of RFC 7231</a>
   */
  static readonly SERVER = 'Server';
  /**
   * The HTTP {@code Set-Cookie} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc2109#section-4.2.2">Section 4.2.2 of RFC 2109</a>
   */
  static readonly SET_COOKIE = 'Set-Cookie';
  /**
   * The HTTP {@code Set-Cookie2} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc2965">RFC 2965</a>
   */
  static readonly SET_COOKIE2 = 'Set-Cookie2';
  /**
   * The HTTP {@code TE} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-4.3">Section 4.3 of RFC 7230</a>
   */
  static readonly TE = 'TE';
  /**
   * The HTTP {@code Trailer} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-4.4">Section 4.4 of RFC 7230</a>
   */
  static readonly TRAILER = 'Trailer';
  /**
   * The HTTP {@code Transfer-Encoding} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-3.3.1">Section 3.3.1 of RFC 7230</a>
   */
  static readonly TRANSFER_ENCODING = 'Transfer-Encoding';
  /**
   * The HTTP {@code Upgrade} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-6.7">Section 6.7 of RFC 7230</a>
   */
  static readonly UPGRADE = 'Upgrade';
  /**
   * The HTTP {@code User-Agent} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-5.5.3">Section 5.5.3 of RFC 7231</a>
   */
  static readonly USER_AGENT = 'User-Agent';
  /**
   * The HTTP {@code Vary} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-7.1.4">Section 7.1.4 of RFC 7231</a>
   */
  static readonly VARY = 'Vary';
  /**
   * The HTTP {@code Via} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7230#section-5.7.1">Section 5.7.1 of RFC 7230</a>
   */
  static readonly VIA = 'Via';
  /**
   * The HTTP {@code Warning} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7234#section-5.5">Section 5.5 of RFC 7234</a>
   */
  static readonly WARNING = 'Warning';
  /**
   * The HTTP {@code WWW-Authenticate} header field name.
   * @see <a href="https://tools.ietf.org/html/rfc7235#section-4.1">Section 4.1 of RFC 7235</a>
   */
  static readonly WWW_AUTHENTICATE = 'WWW-Authenticate';
}
