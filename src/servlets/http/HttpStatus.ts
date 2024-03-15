export default class HttpStatus {

  public readonly code: number

  public readonly message: string

  constructor(code, message) {
    this.code = code;
    this.message = message;
  }

  static AllStatus: Map<number, HttpStatus>;

  // 1xx Informational

  /**
   * {@code 100 Continue}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.2.1">HTTP/1.1: Semantics and Content, section 6.2.1</a>
   */
  static CONTINUE = new HttpStatus(100, "Continue")

  /**
   * {@code 101 Switching Protocols}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.2.2">HTTP/1.1: Semantics and Content, section 6.2.2</a>
   */
  static SWITCHING_PROTOCOLS = new HttpStatus(101, "Switching Protocols")

  /**
   * {@code 102 Processing}.
   * @see <a href="https://tools.ietf.org/html/rfc2518#section-10.1">WebDAV</a>
   */
  static PROCESSING = new HttpStatus(102, "Processing")

  /**
   * {@code 103 Checkpoint}.
   * @see <a href="https://code.google.com/p/gears/wiki/ResumableHttpRequestsProposal">A proposal for supporting
   * resumable POST/PUT HTTP requests in HTTP/1.0</a>
   */
  static CHECKPOINT = new HttpStatus(103, "Checkpoint")

  // 2xx Success

  /**
   * {@code 200 OK}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.1">HTTP/1.1: Semantics and Content, section 6.3.1</a>
   */
  static OK = new HttpStatus(200, "OK")

  /**
   * {@code 201 Created}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.2">HTTP/1.1: Semantics and Content, section 6.3.2</a>
   */
  static CREATED = new HttpStatus(201, "Created")

  /**
   * {@code 202 Accepted}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.3">HTTP/1.1: Semantics and Content, section 6.3.3</a>
   */
  static ACCEPTED = new HttpStatus(202, "Accepted")

  /**
   * {@code 203 Non-Authoritative Information}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.4">HTTP/1.1: Semantics and Content, section 6.3.4</a>
   */
  static NON_AUTHORITATIVE_INFORMATION = new HttpStatus(203, "Non-Authoritative Information")

  /**
   * {@code 204 No Content}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.5">HTTP/1.1: Semantics and Content, section 6.3.5</a>
   */
  static NO_CONTENT = new HttpStatus(204, "No Content")

  /**
   * {@code 205 Reset Content}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.3.6">HTTP/1.1: Semantics and Content, section 6.3.6</a>
   */
  static RESET_CONTENT = new HttpStatus(205, "Reset Content")

  /**
   * {@code 206 Partial Content}.
   * @see <a href="https://tools.ietf.org/html/rfc7233#section-4.1">HTTP/1.1: Range Requests, section 4.1</a>
   */
  static PARTIAL_CONTENT = new HttpStatus(206, "Partial Content")

  /**
   * {@code 207 Multi-Status}.
   * @see <a href="https://tools.ietf.org/html/rfc4918#section-13">WebDAV</a>
   */
  static MULTI_STATUS = new HttpStatus(207, "Multi-Status")

  /**
   * {@code 208 Already Reported}.
   * @see <a href="https://tools.ietf.org/html/rfc5842#section-7.1">WebDAV Binding Extensions</a>
   */
  static ALREADY_REPORTED = new HttpStatus(208, "Already Reported")

  /**
   * {@code 226 IM Used}.
   * @see <a href="https://tools.ietf.org/html/rfc3229#section-10.4.1">Delta encoding in HTTP</a>
   */
  static IM_USED = new HttpStatus(226, "IM Used")

  // 3xx Redirection

  /**
   * {@code 300 Multiple Choices}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.1">HTTP/1.1: Semantics and Content, section 6.4.1</a>
   */
  static MULTIPLE_CHOICES = new HttpStatus(300, "Multiple Choices")

  /**
   * {@code 301 Moved Permanently}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.2">HTTP/1.1: Semantics and Content, section 6.4.2</a>
   */
  static MOVED_PERMANENTLY = new HttpStatus(301, "Moved Permanently")

  /**
   * {@code 302 Found}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.3">HTTP/1.1: Semantics and Content, section 6.4.3</a>
   */
  static FOUND = new HttpStatus(302, "Found")

  /**
   * {@code 302 Moved Temporarily}.
   * @see <a href="https://tools.ietf.org/html/rfc1945#section-9.3">HTTP/1.0, section 9.3</a>
   * @deprecated in favor of {@link #FOUND} which will be returned from {@code HttpStatus.valueOf(302)}
   */
  static MOVED_TEMPORARILY = new HttpStatus(302, "Moved Temporarily")

  /**
   * {@code 303 See Other}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.4">HTTP/1.1: Semantics and Content, section 6.4.4</a>
   */
  static SEE_OTHER = new HttpStatus(303, "See Other")

  /**
   * {@code 304 Not Modified}.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-4.1">HTTP/1.1: Conditional Requests, section 4.1</a>
   */
  static NOT_MODIFIED = new HttpStatus(304, "Not Modified")

  /**
   * {@code 305 Use Proxy}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.5">HTTP/1.1: Semantics and Content, section 6.4.5</a>
   * @deprecated due to security concerns regarding in-band configuration of a proxy
   */
  static USE_PROXY = new HttpStatus(305, "Use Proxy")

  /**
   * {@code 307 Temporary Redirect}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.4.7">HTTP/1.1: Semantics and Content, section 6.4.7</a>
   */
  static TEMPORARY_REDIRECT = new HttpStatus(307, "Temporary Redirect")

  /**
   * {@code 308 Permanent Redirect}.
   * @see <a href="https://tools.ietf.org/html/rfc7238">RFC 7238</a>
   */
  static PERMANENT_REDIRECT = new HttpStatus(308, "Permanent Redirect")

  // --- 4xx Client Error ---

  /**
   * {@code 400 Bad Request}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.1">HTTP/1.1: Semantics and Content, section 6.5.1</a>
   */
  static BAD_REQUEST = new HttpStatus(400, "Bad Request")

  /**
   * {@code 401 Unauthorized}.
   * @see <a href="https://tools.ietf.org/html/rfc7235#section-3.1">HTTP/1.1: Authentication, section 3.1</a>
   */
  static UNAUTHORIZED = new HttpStatus(401, "Unauthorized")

  /**
   * {@code 402 Payment Required}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.2">HTTP/1.1: Semantics and Content, section 6.5.2</a>
   */
  static PAYMENT_REQUIRED = new HttpStatus(402, "Payment Required")

  /**
   * {@code 403 Forbidden}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.3">HTTP/1.1: Semantics and Content, section 6.5.3</a>
   */
  static FORBIDDEN = new HttpStatus(403, "Forbidden")

  /**
   * {@code 404 Not Found}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.4">HTTP/1.1: Semantics and Content, section 6.5.4</a>
   */
  static NOT_FOUND = new HttpStatus(404, "Not Found")

  /**
   * {@code 405 Method Not Allowed}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.5">HTTP/1.1: Semantics and Content, section 6.5.5</a>
   */
  static METHOD_NOT_ALLOWED = new HttpStatus(405, "Method Not Allowed")

  /**
   * {@code 406 Not Acceptable}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.6">HTTP/1.1: Semantics and Content, section 6.5.6</a>
   */
  static NOT_ACCEPTABLE = new HttpStatus(406, "Not Acceptable")

  /**
   * {@code 407 Proxy Authentication Required}.
   * @see <a href="https://tools.ietf.org/html/rfc7235#section-3.2">HTTP/1.1: Authentication, section 3.2</a>
   */
  static PROXY_AUTHENTICATION_REQUIRED = new HttpStatus(407, "Proxy Authentication Required")

  /**
   * {@code 408 Request Timeout}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.7">HTTP/1.1: Semantics and Content, section 6.5.7</a>
   */
  static REQUEST_TIMEOUT = new HttpStatus(408, "Request Timeout")

  /**
   * {@code 409 Conflict}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.8">HTTP/1.1: Semantics and Content, section 6.5.8</a>
   */
  static CONFLICT = new HttpStatus(409, "Conflict")

  /**
   * {@code 410 Gone}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.9">
   *     HTTP/1.1: Semantics and Content, section 6.5.9</a>
   */
  static GONE = new HttpStatus(410, "Gone")

  /**
   * {@code 411 Length Required}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.10">
   *     HTTP/1.1: Semantics and Content, section 6.5.10</a>
   */
  static LENGTH_REQUIRED = new HttpStatus(411, "Length Required")

  /**
   * {@code 412 Precondition failed}.
   * @see <a href="https://tools.ietf.org/html/rfc7232#section-4.2">
   *     HTTP/1.1: Conditional Requests, section 4.2</a>
   */
  static PRECONDITION_FAILED = new HttpStatus(412, "Precondition Failed")

  /**
   * {@code 413 Payload Too Large}.
   * @since 4.1
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.11">
   *     HTTP/1.1: Semantics and Content, section 6.5.11</a>
   */
  static PAYLOAD_TOO_LARGE = new HttpStatus(413, "Payload Too Large")

  /**
   * {@code 413 Request Entity Too Large}.
   * @see <a href="https://tools.ietf.org/html/rfc2616#section-10.4.14">HTTP/1.1, section 10.4.14</a>
   * @deprecated in favor of {@link #PAYLOAD_TOO_LARGE} which will be
   * returned from {@code HttpStatus.valueOf(413)}
   */
  static REQUEST_ENTITY_TOO_LARGE = new HttpStatus(413, "Request Entity Too Large")

  /**
   * {@code 414 URI Too Long}.
   * @since 4.1
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.12">
   *     HTTP/1.1: Semantics and Content, section 6.5.12</a>
   */
  static URI_TOO_LONG = new HttpStatus(414, "URI Too Long")

  /**
   * {@code 414 Request-URI Too Long}.
   * @see <a href="https://tools.ietf.org/html/rfc2616#section-10.4.15">HTTP/1.1, section 10.4.15</a>
   * @deprecated in favor of {@link #URI_TOO_LONG} which will be returned from {@code HttpStatus.valueOf(414)}
   */
  static REQUEST_URI_TOO_LONG = new HttpStatus(414, "Request-URI Too Long")

  /**
   * {@code 415 Unsupported Media Type}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.13">
   *     HTTP/1.1: Semantics and Content, section 6.5.13</a>
   */
  static UNSUPPORTED_MEDIA_TYPE = new HttpStatus(415, "Unsupported Media Type")

  /**
   * {@code 416 Requested Range Not Satisfiable}.
   * @see <a href="https://tools.ietf.org/html/rfc7233#section-4.4">HTTP/1.1: Range Requests, section 4.4</a>
   */
  static REQUESTED_RANGE_NOT_SATISFIABLE = new HttpStatus(416, "Requested range not satisfiable")

  /**
   * {@code 417 Expectation Failed}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.5.14">
   *     HTTP/1.1: Semantics and Content, section 6.5.14</a>
   */
  static EXPECTATION_FAILED = new HttpStatus(417, "Expectation Failed")

  /**
   * {@code 418 I'm a teapot}.
   * @see <a href="https://tools.ietf.org/html/rfc2324#section-2.3.2">HTCPCP/1.0</a>
   */
  static I_AM_A_TEAPOT = new HttpStatus(418, "I'm a teapot")

  /**
   * @deprecated See
   * <a href="https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt">
   *     WebDAV Draft Changes</a>
   */
  static INSUFFICIENT_SPACE_ON_RESOURCE = new HttpStatus(419, "Insufficient Space On Resource")

  /**
   * @deprecated See
   * <a href="https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt">
   *     WebDAV Draft Changes</a>
   */
  static METHOD_FAILURE = new HttpStatus(420, "Method Failure")

  /**
   * @deprecated
   * See <a href="https://tools.ietf.org/rfcdiff?difftype=--hwdiff&url2=draft-ietf-webdav-protocol-06.txt">
   *     WebDAV Draft Changes</a>
   */
  static DESTINATION_LOCKED = new HttpStatus(421, "Destination Locked")

  /**
   * {@code 422 Unprocessable Entity}.
   * @see <a href="https://tools.ietf.org/html/rfc4918#section-11.2">WebDAV</a>
   */
  static UNPROCESSABLE_ENTITY = new HttpStatus(422, "Unprocessable Entity")

  /**
   * {@code 423 Locked}.
   * @see <a href="https://tools.ietf.org/html/rfc4918#section-11.3">WebDAV</a>
   */
  static LOCKED = new HttpStatus(423, "Locked")

  /**
   * {@code 424 Failed Dependency}.
   * @see <a href="https://tools.ietf.org/html/rfc4918#section-11.4">WebDAV</a>
   */
  static FAILED_DEPENDENCY = new HttpStatus(424, "Failed Dependency")

  /**
   * {@code 425 Too Early}.
   * @since 5.2
   * @see <a href="https://tools.ietf.org/html/rfc8470">RFC 8470</a>
   */
  static TOO_EARLY = new HttpStatus(425, "Too Early")

  /**
   * {@code 426 Upgrade Required}.
   * @see <a href="https://tools.ietf.org/html/rfc2817#section-6">Upgrading to TLS Within HTTP/1.1</a>
   */
  static UPGRADE_REQUIRED = new HttpStatus(426, "Upgrade Required")

  /**
   * {@code 428 Precondition Required}.
   * @see <a href="https://tools.ietf.org/html/rfc6585#section-3">Additional HTTP Status Codes</a>
   */
  static PRECONDITION_REQUIRED = new HttpStatus(428, "Precondition Required")

  /**
   * {@code 429 Too Many Requests}.
   * @see <a href="https://tools.ietf.org/html/rfc6585#section-4">Additional HTTP Status Codes</a>
   */
  static TOO_MANY_REQUESTS = new HttpStatus(429, "Too Many Requests")

  /**
   * {@code 431 Request Header Fields Too Large}.
   * @see <a href="https://tools.ietf.org/html/rfc6585#section-5">Additional HTTP Status Codes</a>
   */
  static REQUEST_HEADER_FIELDS_TOO_LARGE = new HttpStatus(431, "Request Header Fields Too Large")

  /**
   * {@code 451 Unavailable For Legal Reasons}.
   * @see <a href="https://tools.ietf.org/html/draft-ietf-httpbis-legally-restricted-status-04">
   * An HTTP Status Code to Report Legal Obstacles</a>
   * @since 4.3
   */
  static UNAVAILABLE_FOR_LEGAL_REASONS = new HttpStatus(451, "Unavailable For Legal Reasons")

  // --- 5xx Server Error ---

  /**
   * {@code 500 Internal Server Error}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.1">HTTP/1.1: Semantics and Content, section 6.6.1</a>
   */
  static INTERNAL_SERVER_ERROR = new HttpStatus(500, "Internal Server Error")

  /**
   * {@code 501 Not Implemented}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.2">HTTP/1.1: Semantics and Content, section 6.6.2</a>
   */
  static NOT_IMPLEMENTED = new HttpStatus(501, "Not Implemented")

  /**
   * {@code 502 Bad Gateway}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.3">HTTP/1.1: Semantics and Content, section 6.6.3</a>
   */
  static BAD_GATEWAY = new HttpStatus(502, "Bad Gateway")

  /**
   * {@code 503 Service Unavailable}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.4">HTTP/1.1: Semantics and Content, section 6.6.4</a>
   */
  static SERVICE_UNAVAILABLE = new HttpStatus(503, "Service Unavailable")

  /**
   * {@code 504 Gateway Timeout}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.5">HTTP/1.1: Semantics and Content, section 6.6.5</a>
   */
  static GATEWAY_TIMEOUT = new HttpStatus(504, "Gateway Timeout")

  /**
   * {@code 505 HTTP Version Not Supported}.
   * @see <a href="https://tools.ietf.org/html/rfc7231#section-6.6.6">HTTP/1.1: Semantics and Content, section 6.6.6</a>
   */
  static HTTP_VERSION_NOT_SUPPORTED = new HttpStatus(505, "HTTP Version not supported")

  /**
   * {@code 506 Variant Also Negotiates}
   * @see <a href="https://tools.ietf.org/html/rfc2295#section-8.1">Transparent Content Negotiation</a>
   */
  static VARIANT_ALSO_NEGOTIATES = new HttpStatus(506, "Variant Also Negotiates")

  /**
   * {@code 507 Insufficient Storage}
   * @see <a href="https://tools.ietf.org/html/rfc4918#section-11.5">WebDAV</a>
   */
  static INSUFFICIENT_STORAGE = new HttpStatus(507, "Insufficient Storage")

  /**
   * {@code 508 Loop Detected}
   * @see <a href="https://tools.ietf.org/html/rfc5842#section-7.2">WebDAV Binding Extensions</a>
   */
  static LOOP_DETECTED = new HttpStatus(508, "Loop Detected")

  /**
   * {@code 509 Bandwidth Limit Exceeded}
   */
  static BANDWIDTH_LIMIT_EXCEEDED = new HttpStatus(509, "Bandwidth Limit Exceeded")

  /**
   * {@code 510 Not Extended}
   * @see <a href="https://tools.ietf.org/html/rfc2774#section-7">HTTP Extension Framework</a>
   */
  static NOT_EXTENDED = new HttpStatus(510, "Not Extended")

  /**
   * {@code 511 Network Authentication Required}.
   * @see <a href="https://tools.ietf.org/html/rfc6585#section-6">Additional HTTP Status Codes</a>
   */
  static NETWORK_AUTHENTICATION_REQUIRED = new HttpStatus(511, "Network Authentication Required")
}


HttpStatus.AllStatus = new Map<number, HttpStatus>();

Object.keys(HttpStatus).forEach((key) => {
  const v = HttpStatus[key];
  if (v instanceof HttpStatus) {
    HttpStatus.AllStatus.set(v.code, v);
  }
})
