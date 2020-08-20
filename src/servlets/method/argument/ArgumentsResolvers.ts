/**
 * @module ArgumentsResolvers
 * @description 参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import RequestResponseBodyMethodProcessor from './RequestResponseBodyMethodProcessor';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';
import RequestParamMapMethodArgumentResolver from './RequestParamMapMethodArgumentResolver';
import RequestHeaderMapMethodArgumentResolver from './RequestHeaderMapMethodArgumentResolver';
import PathVariableMapMethodArgumentResolver from './PathVariableMapMethodArgumentResolver';
import ServletContextMethodArgumentResolver from './ServletContextMethodArgumentResolver';
import HandlerMethod from '../HandlerMethod';
import ParameterRequiredError from '../../../errors/ParameterRequiredError';
import hot from 'nodejs-hmr';

const registerResolvers: Array<HandlerMethodArgumentResolver> = [
  new PathVariableMapMethodArgumentResolver(),
  new RequestHeaderMapMethodArgumentResolver(),
  new RequestParamMapMethodArgumentResolver(),
  new RequestResponseBodyMethodProcessor(),
  new ServletContextMethodArgumentResolver()
]

export default class ArgumentsResolvers {

  /**
   * 注册一个参数解析器
   * @param parameter 
   * @param servletContext 
   */
  static addArgumentResolvers(resolver: HandlerMethodArgumentResolver) {
    registerResolvers.push(resolver);
  }

  /**
   * 获取要执行函数的参数值信息
   */
  static async resolveArguments(servletContext: ServletContext, handler: HandlerMethod): Promise<Array<any>> {
    const signParameters = handler.signParameters;
    const args = [];
    for (let i = 0, k = signParameters.length; i < k; i++) {
      const name = signParameters[i];
      const parameter = handler.getResolveParameter(name);
      if (!parameter) {
        // 如果缺少参数
        return Promise.reject(new ParameterRequiredError(name, servletContext));
      }
      const value = await this.resolveArgument(parameter, servletContext);
      const hasResolved = (value !== undefined && value !== null);
      const finalValue = hasResolved ? value : parameter.defaultValue;
      if (parameter.required && (finalValue === null || finalValue === undefined)) {
        // 如果缺少参数
        return Promise.reject(new ParameterRequiredError(name, servletContext));
      }
      // 设置参数值
      args[i] = finalValue;
    }
    return args;
  }

  /**
   * 解析当前参数值
   * @param { MethodParameter } parameter 当前参数
   * @param { ServletContext } servletContext 当前请求上下文
   */
  static resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const resolver = registerResolvers.find((resolver) => resolver.supportsParameter(parameter, servletContext));
    return resolver ? resolver.resolveArgument(parameter, servletContext) : undefined;
  }
}

/**
 * 内部热更新 
 */
hot.create(module)
  .postend((now, old) => {
    new hot.ListReplacement(registerResolvers, now, old);
  });
