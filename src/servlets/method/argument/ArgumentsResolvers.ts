/**
 * @module ArgumentsResolvers
 * @description 参数解析器
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from '../MethodParameter';
import RequestResponseBodyMethodProcessor from '../processor/RequestResponseBodyMethodProcessor';
import HandlerMethodArgumentResolver from './HandlerMethodArgumentResolver';
import RequestParamMapMethodArgumentResolver from './RequestParamMapMethodArgumentResolver';
import RequestHeaderMapMethodArgumentResolver from './RequestHeaderMapMethodArgumentResolver';
import PathVariableMapMethodArgumentResolver from './PathVariableMapMethodArgumentResolver';
import ServletContextMethodArgumentResolver from './ServletContextMethodArgumentResolver';
import HandlerMethod from '../HandlerMethod';
import ArgumentResolvError from '../../../errors/ArgumentResolvError';
import IllegalArgumentException from '../../../errors/IllegalArgumentException';
import ParamAnnotation from '../../annotations/params/ParamAnnotation';
import MessageConverter from '../../http/converts/MessageConverter';
import ValueConvertError from '../../../errors/ValueConvertError';
import ArgumentConvertError from '../../../errors/ArgumentConvertError';
import MultipartFile from '../../http/MultipartFile';
import Javascript from '../../../interface/Javascript';
import ModelAttributeMethodProcessor from '../processor/ModelAttributeMethodProcessor';
import ContentNegotiationManager from '../../http/accept/ContentNegotiationManager';
import RequestPartArgumentResolver from './RequestPartArgumentResolver';
import HttpEntityMethodProcessor from '../processor/HttpEntityMethodProcessor';
import DataValidator from '../../../validation/DataValidator';
import TypeConverter from '../../../serialization/TypeConverter';

const converter = new TypeConverter();

export default class ArgumentsResolvers {
  private readonly registerResolvers: HandlerMethodArgumentResolver[];

  private readonly fallbackResolvers: HandlerMethodArgumentResolver[];

  private readonly messageConverter: MessageConverter;

  constructor(messageConverter: MessageConverter, contentNegotialManager: ContentNegotiationManager) {
    this.messageConverter = messageConverter;
    this.registerResolvers = [
      new PathVariableMapMethodArgumentResolver(),
      new RequestHeaderMapMethodArgumentResolver(),
      new RequestParamMapMethodArgumentResolver(false),
      new RequestPartArgumentResolver(),
      new HttpEntityMethodProcessor(messageConverter, contentNegotialManager),
      new ModelAttributeMethodProcessor(),
      new RequestResponseBodyMethodProcessor(this.messageConverter, contentNegotialManager),
      new ServletContextMethodArgumentResolver(),
    ];
    this.fallbackResolvers = [
      new RequestParamMapMethodArgumentResolver(true),
    ];
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
  async resolveArguments(servletContext: ServletContext, handler: HandlerMethod): Promise<any[]> {
    let parameter: MethodParameter;
    try {
      const signParameters = handler.parameters;
      const args = [];
      for (let i = 0, k = signParameters.length; i < k; i++) {
        parameter = signParameters[i];
        const anno = parameter.getParameterAnnotation(ParamAnnotation);
        const value = await this.resolveArgument(parameter, servletContext);
        const hasResolved = (value !== undefined && value !== null);
        let finalValue = hasResolved ? value : anno?.defaultValue;
        const hasNotValue = finalValue === null || finalValue === undefined;
        if (hasNotValue && anno?.required) {
          // 如果参数必要，且没有值则抛出异常
          const message = `Required ${anno.paramAt} '${parameter.paramName}' is not present ==> ${handler.beanTypeName}.${handler.methodName}`;
          throw new ArgumentResolvError(message, parameter.paramName);
        } else if (hasNotValue && !anno?.required) {
          // 如果参数不必要，且没有值，则忽略
          args[i] = undefined;
          continue;
        }
        if (finalValue instanceof MultipartFile && Javascript.createTyper(parameter.parameterType).isType(Array)) {
          finalValue = [ finalValue ];
        }
        // 设置参数值
        args[i] = converter.convert(finalValue, parameter.parameterType, null);
        // 验证数据
        await (new DataValidator()).validate(args[i], parameter);
      }
      return args;
    } catch (ex) {
      if (ex instanceof ValueConvertError) {
        return Promise.reject(new ArgumentConvertError(parameter?.paramName, ex));
      }
      if (ex instanceof Error && ex.constructor !== Error) {
        return Promise.reject(ex);
      }
      return Promise.reject(new ArgumentResolvError(ex, parameter?.paramName));
    }
  }

  /**
   * 解析当前参数值
   * @param { MethodParameter } parameter 当前参数
   * @param { ServletContext } servletContext 当前请求上下文
   */
  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const registerResolvers = [].concat(this.registerResolvers, this.fallbackResolvers);
    const resolver = registerResolvers.find((resolver) => resolver.supportsParameter(parameter, servletContext));
    if (resolver === null) {
      throw new IllegalArgumentException('Unsupported parameter type [' + Object.prototype.toString.call(parameter.parameterType) + ']. supportsParameter should be called first.');
    }
    return resolver.resolveArgument(parameter, servletContext);
  }
}
