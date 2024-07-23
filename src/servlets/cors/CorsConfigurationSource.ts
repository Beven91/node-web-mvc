import type HttpServletRequest from "../http/HttpServletRequest";
import CorsConfiguration from "./CorsConfiguration";


export default abstract class CorsConfigurationSource {

  // 获取跨域配置
  abstract getCorsConfiguration(request: HttpServletRequest): CorsConfiguration

}