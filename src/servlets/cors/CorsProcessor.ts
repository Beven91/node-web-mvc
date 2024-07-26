import type HttpServletRequest from '../http/HttpServletRequest';
import type HttpServletResponse from '../http/HttpServletResponse';
import CorsConfiguration from './CorsConfiguration';

export default interface CorsProcessor {

  /**
   * 处理跨域请求
   * @param config { CorsConfiguration } 跨域配置
   * @param context 请求上下文
   * @return false=表示请求被拒绝 true=继续
   */
  processRequest(config: CorsConfiguration, request: HttpServletRequest, response: HttpServletResponse): Promise<boolean>

}
