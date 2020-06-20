/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../ServletContext';
import ServletModel from '../../models/ServletModel';
import ArgumentsResolvers from '../argument/ArgumentsResolvers';

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
  getMethodArgumentValues(servletContext: ServletContext, handler: HandlerMethod): Promise<Array<any>> {
    const parameters = handler.parameters;
    // 开始解析方法参数值
    return Promise.all(
      parameters
        .map((parameter) => {
          return ArgumentsResolvers.resolveArgument(parameter, servletContext)
        })
    );
  }
}