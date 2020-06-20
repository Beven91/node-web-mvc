/**
 * @module ArgumentsResolvers
 * @description 参数解析器
 */
import ServletContext from '../ServletContext';
import MethodParameter from "../../interface/MethodParameter";
import RequestResponseBodyMethodProcessor from './RequestResponseBodyMethodProcessor';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';

const registerResolvers: Array<HandlerMethodArgumentResolver> = [
  new RequestResponseBodyMethodProcessor()
]

export default class ArgumentsResolvers {

  /**
   * 注册一个参数解析器
   * @param parameter 
   * @param servletContext 
   */
  static registerResolver(resolver: HandlerMethodArgumentResolver) {
    registerResolvers.push(resolver);
  }

  /**
   * 解析当前参数值
   * @param { MethodParameter } parameter 当前参数
   * @param { ServletContext } servletContext 当前请求上下文
   */
  static resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const resolver = registerResolvers.find((resolver) => resolver.supportsParameter(parameter));
    return resolver ? resolver.resolveArgument(parameter, servletContext) : undefined;
  }
}
