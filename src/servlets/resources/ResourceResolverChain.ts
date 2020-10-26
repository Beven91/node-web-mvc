/**
 * @moduel ResourceResolverChain
 * @description
 */
import HttpServletRequest from "../http/HttpServletRequest";
import ResourceResolver from "./ResourceResolver";
import Resource from "./Resource";

export default class ResourceResolverChain {

  // 资源解析器
  private readonly resolver: ResourceResolver

  // 下一个执行链
  private readonly nextChain: ResourceResolverChain

  private get invokeable() {
    return this.resolver != null && this.nextChain != null;
  }

  constructor(resolvers: Array<ResourceResolver> | ResourceResolver, chain?: ResourceResolverChain) {
    if (arguments.length === 2) {
      this.resolver = resolvers as ResourceResolver;
      this.nextChain = chain;
    } else {
      let chain = new ResourceResolverChain(null, null);
      resolvers = (resolvers || []) as Array<ResourceResolver>
      resolvers.forEach((resolver) => {
        chain = new ResourceResolverChain(resolver, chain);
      });
      this.resolver = chain.resolver;
      this.nextChain = chain.nextChain;
    }
  }

  /**
   * 根据当前请求以及解析配置来解析资源
   * @param request 当前请求对象
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  async resolveResource(request: HttpServletRequest, requestPath: string, locations: Array<Resource>): Promise<Resource> {
    if (!this.invokeable) {
      return null;
    }
    return await this.resolver.resolveResource(request, requestPath, locations, this.nextChain);
  }

  /**
   * 根据当前请求以及解析配置来解析资源路径
   * @param requestPath 当前请求路径
   * @param locations 搜索范围位置
   */
  async resolveUrlPath(resourcePath: string, locations: Array<Resource>): Promise<string> {
    if (!this.invokeable) {
      return null;
    }
    return await this.resolver.resolveUrlPath(resourcePath, locations, this.nextChain);
  }
}