/**
 * @module ArgumentsResolvers
 * @description 参数解析器
 */
import hot from 'nodejs-hmr';
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import RequestResponseBodyMethodProcessor from './RequestResponseBodyMethodProcessor';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';
import RequestParamMapMethodArgumentResolver from './RequestParamMapMethodArgumentResolver';
import RequestHeaderMapMethodArgumentResolver from './RequestHeaderMapMethodArgumentResolver';
import PathVariableMapMethodArgumentResolver from './PathVariableMapMethodArgumentResolver';
import ServletContextMethodArgumentResolver from './ServletContextMethodArgumentResolver';
import HandlerMethod from '../HandlerMethod';
import ArgumentResolvError from '../../../errors/ArgumentResolvError';
import ArgumentConverter from './ArgumentConverter';
import RequestPartMapMethodArgumentResolver from './RequestPartMapMethodArgumentResolver';

export default class ArgumentsResolvers {

  private readonly registerResolvers: Array<HandlerMethodArgumentResolver>

  constructor() {
    this.registerResolvers = [
      new PathVariableMapMethodArgumentResolver(),
      new RequestHeaderMapMethodArgumentResolver(),
      new RequestParamMapMethodArgumentResolver(),
      new RequestPartMapMethodArgumentResolver(),
      new RequestResponseBodyMethodProcessor(),
      new ServletContextMethodArgumentResolver()
    ];
    // 热更新处理
    acceptHot(this.registerResolvers);
  }

  /**
   * 注册一个参数解析器
   * @param resolver 解析器 
   */
  addArgumentResolvers(resolver: HandlerMethodArgumentResolver) {
    this.registerResolvers.push(resolver);
  }

  /**
   * 获取要执行函数的参数值信息
   */
  async resolveArguments(servletContext: ServletContext, handler: HandlerMethod): Promise<Array<any>> {
    let parameter;
    try {
      const signParameters = handler.parameters;
      const args = [];
      for (let i = 0, k = signParameters.length; i < k; i++) {
        parameter = signParameters[i];
        const value = await this.resolveArgument(parameter, servletContext);
        // this.checkArguments(parameter, value);
        const hasResolved = (value !== undefined && value !== null);
        const finalValue = hasResolved ? value : parameter.defaultValue;
        const hasNotValue = finalValue === null || finalValue === undefined;
        if (parameter.required && hasNotValue) {
          // 如果缺少参数
          const message = `Required request parameter: ${parameter.name} is missing @${handler.beanTypeName}.${handler.methodName}`
          return Promise.reject(new ArgumentResolvError(message, parameter.name));
        }
        // 设置参数值
        const converter = new ArgumentConverter(parameter.dataType);
        args[i] = converter.convert(finalValue);
      }
      return args;
    } catch (ex) {
      return Promise.reject(new ArgumentResolvError(ex, parameter?.name));
    }
  }

  /**
   * 解析当前参数值
   * @param { MethodParameter } parameter 当前参数
   * @param { ServletContext } servletContext 当前请求上下文
   */
  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const registerResolvers = this.registerResolvers;
    const resolver = registerResolvers.find((resolver) => resolver.supportsParameter(parameter, servletContext));
    return resolver ? resolver.resolveArgument(parameter, servletContext) : undefined;
  }
}

/**
 * 内部热更新 
 */
function acceptHot(registerResolvers) {
  hot.create(module)
    .postend((now, old) => {
      hot.createHotUpdater(registerResolvers, now, old).update();
    });
}
