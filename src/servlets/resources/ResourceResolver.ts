/**
 * @module ResourceResolver
 * @description 解析静态资源路径
 */

import HttpServletRequest from "../http/HttpServletRequest";
import ResourceResolverChain from './ResourceResolverChain';
import Resource from "./Resource";

export default interface ResourceResolver {

  // private registration: ResourceHandlerRegistration

  // constructor(registration: ResourceHandlerRegistration) {
  //   this.registration = registration;
  // }

  /**
   * 根据当前请求以及解析配置来解析资源
   * @param request 当前请求对象
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  resolveResource(request: HttpServletRequest, requestPath: string, locations, next: ResourceResolverChain): Promise<Resource>

 /**
  * 根据当前请求以及解析配置来解析资源路径
  * @param requestPath 当前请求路径
  * @param locations 搜索范围位置
  */
  resolveUrlPath(resourcePath: string, locations, chain: ResourceResolverChain): Promise<string>

  // resolve(request: HttpServletRequest): Resource {
  //   const name = request.usePath;
  //   const resourceLocations = this.registration.resourceLocations || [];
  //   const location = resourceLocations.find((root) => {
  //     const file = path.join(root, name);
  //     return fs.existsSync(file);
  //   });
  //   return location ? new Resource(path.join(location, name)) : null;
  // }
}