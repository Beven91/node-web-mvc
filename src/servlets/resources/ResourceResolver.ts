/**
 * @module ResourceResolver
 * @description 解析静态资源路径
 */

import HttpServletRequest from "../http/HttpServletRequest";
import ResourceResolverChain from './ResourceResolverChain';
import Resource from "./Resource";

export default interface ResourceResolver {

  /**
   * 根据当前请求以及解析配置来解析资源
   * @param request 当前请求对象
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  resolveResource(request: HttpServletRequest, requestPath: string, locations: Array<Resource>, next: ResourceResolverChain): Promise<Resource>

  /**
   * 根据当前请求以及解析配置来解析资源路径
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  resolveUrlPath(resourcePath: string, locations: Array<Resource>, chain: ResourceResolverChain): Promise<string>

}