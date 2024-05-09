/**
 * @module WebpackResourceResolver
 * @description webpack资源解析器
 */
import HttpServletRequest from '../http/HttpServletRequest';
import Resource from './Resource';
import ResourceResolverChain from './ResourceResolverChain';
import ResourceResolver from './ResourceResolver';
import Middlewares from '../models/Middlewares';
import { Middleware } from '../../interface/declare';

export default class MiddlewareResourceResolver implements ResourceResolver {

  private middlewares: Array<Middleware>

  /**
   * @param configId webpack配置文件
   */
  constructor(...middlewares: Array<Middleware>) {
    this.middlewares = middlewares || [];
  }

  /**
   * 根据当前请求以及解析配置来解析资源
   * @param request 当前请求对象
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  resolveResource(request: HttpServletRequest, requestPath: string, locations: Array<Resource>, next: ResourceResolverChain): Promise<Resource> {
    if (this.middlewares.length < 1) {
      return next.resolveResource(request, requestPath, locations);
    }
    const invoker = new Middlewares(this.middlewares);
    return invoker.execute<Resource>(
      request,
      request.servletContext.response,
      () => {
        // 如果中间件，没有捕获到资源，则使用下一个解析器。
        return next.resolveResource(request, requestPath, locations);
      }
    )
  }

  /**
   * 根据当前请求以及解析配置来解析资源路径
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  resolveUrlPath(resourcePath: string, locations: Array<Resource>, chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}