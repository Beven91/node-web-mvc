/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import ArgumentsResolvers from './argument/ArgumentsResolvers';
import ParameterRequiredError from '../../errors/ParameterRequiredError';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {

  supportsInternal() {
    return true;
  }

  handleInternal(servletContext: ServletContext, handler: HandlerMethod): Promise<ServletModel> {
    // 解析参数值
    const resolvedArgs = this.getMethodArgumentValues(servletContext, handler);
    // 执行接口函数
    return Promise.resolve(resolvedArgs).then((args) => {
      // 返回结果
      return handler.invoke(...args);
    })
  }

  /**
   * 获取要执行函数的参数值信息
   */
  async getMethodArgumentValues(servletContext: ServletContext, handler: HandlerMethod): Promise<Array<any>> {
    const parameters = handler.parameters;
    const args = [];
    for (let i = 0, k = parameters.length; i < k; i++) {
      const parameter = parameters[i];
      const value = await ArgumentsResolvers.resolveArgument(parameter, servletContext);
      const hasResolved = (value !== undefined && value !== null);
      const finalValue = hasResolved ? value : parameter.defaultValue;
      if (parameter.required && (finalValue === null || finalValue === undefined)) {
        // 如果缺少参数
        return Promise.reject(new ParameterRequiredError(parameter, servletContext));
      }
      // 设置参数值
      args[i] = finalValue;
    }
    return args;
  }
}