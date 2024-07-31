import HttpHeaders from '../http/HttpHeaders';
import HttpMethod from '../http/HttpMethod';
import type HttpServletRequest from '../http/HttpServletRequest';
import { isEmpty } from './ApiUtils';

const isEqual = (value1: any, value2: any) => {
  if (value1 === undefined || value1 === null || value2 === undefined || value2 === null) {
    return false;
  }
  return value1 === value2;
};

export default {

  /**
   * 判断当前请求是否为跨域请求
   * @param request
   * @returns
   */
  isCrossRequest(request: HttpServletRequest) {
    const origin = request.getHeaderValue(HttpHeaders.ORIGIN)?.[0];
    if (isEmpty(origin)) {
      return false;
    }
    const uRL = new URL(origin, `xx://127.0.0.0`);
    const isSameOrigin = (
      // 协议相等
      isEqual(request.protocol, uRL.protocol.replace(':', '')) &&
      // 域名相等
      isEqual(request.host, uRL.hostname) &&
      // 端口相等
      isEqual(request.port, uRL.port)
    );
    return !isSameOrigin;
  },

  /**
   * 判断当前是否为预请求
   */
  isPreFlightRequest(request: HttpServletRequest) {
    return (
      request.method == HttpMethod.OPTIONS &&
      !!request.getHeader(HttpHeaders.ORIGIN) &&
      !!request.getHeader(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD)
    );
  },
};
