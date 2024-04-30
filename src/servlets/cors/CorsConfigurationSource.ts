import type HttpServletRequest from "../http/HttpServletRequest";
import CorsConfiguration from "./CorsConfiguration";


export default interface CorsConfigurationSource {

  // 获取跨域配置
  getCorsConfiguration(request: HttpServletRequest): CorsConfiguration

}