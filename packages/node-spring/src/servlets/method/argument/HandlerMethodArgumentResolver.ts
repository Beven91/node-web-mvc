/**
 * @module HandlerMethodArgumentResolver
 * @description 参数解析基类
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from '../MethodParameter';

export default interface HandlerMethodArgumentResolver {

  /**
   * 用于判断当前，解析器是否能解析当前参数
   * @param { MethodParameter } parameter 当前参数
   */
  supportsParameter(parameter: MethodParameter, servletContext: ServletContext): boolean;

  /**
   * 解析当前参数值
   * @param { MethodParameter } parameter 当前参数
   * @param { ServletContext } servletContext 当前请求上下文
   */
  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any
}
