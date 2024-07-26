import HttpRequestHandler from '../http/HttpRequestHandler';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';
import HttpStatus from '../http/HttpStatus';
import CorsConfiguration from './CorsConfiguration';
import CorsInterceptor from './CorsInterceptor';
import CorsProcessor from './CorsProcessor';

export default class PreFlightHandler extends CorsInterceptor implements HttpRequestHandler {
  constructor(corsConfig: CorsConfiguration, processor: CorsProcessor) {
    super(corsConfig, processor);
  }

  async handleRequest(request: HttpServletRequest, response: HttpServletResponse): Promise<void> {
    // 在Options请求下，无需处理内容
    response.setStatus(HttpStatus.OK).end();
  }
}
