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
import ParameterRequiredError from '../../../errors/ParameterRequiredError';
import ArgumentResolvError from '../../../errors/ArgumentResolvError';

export default class ArgumentsResolvers {

  private readonly registerResolvers: Array<HandlerMethodArgumentResolver>

  constructor() {
    this.registerResolvers = [
      new PathVariableMapMethodArgumentResolver(),
      new RequestHeaderMapMethodArgumentResolver(),
      new RequestParamMapMethodArgumentResolver(),
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
    try {
      const signParameters = handler.parameters;
      const args = [];
      for (let i = 0, k = signParameters.length; i < k; i++) {
        const parameter = signParameters[i];
        const value = await this.resolveArgument(parameter, servletContext);
        this.checkArguments(parameter, value);
        const hasResolved = (value !== undefined && value !== null);
        const finalValue = hasResolved ? value : parameter.defaultValue;
        if (parameter.required && (finalValue === null || finalValue === undefined)) {
          // 如果缺少参数
          return Promise.reject(new ParameterRequiredError(parameter.name, servletContext));
        }
        // 设置参数值
        args[i] = finalValue;
      }
      return args;
    } catch (ex) {
      ex = ex instanceof ParameterRequiredError ? ex : new ArgumentResolvError(ex.message);
      throw ex;
    }
  }

  /**
   * 校验参数
   */
  checkArguments(parameter: MethodParameter, value) {
    if (parameter.dataType === Array && value && !(value instanceof Array)) {
      throw new ArgumentResolvError(`The parameter 【${parameter.name}】 needs to be an 【Array】`)
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
