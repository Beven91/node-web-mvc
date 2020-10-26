/**
 * @module ResourceHandlerRegistration
 * @description 
 */
import CacheControl from '../http/CacheControl';
import ResourceHandlerMapping from './ResourceHandlerMapping';
import ResourceChainRegistration from './ResourceChainRegistration';

export default class ResourceHandlerRegistration {

  /**
   * 获取当前注册的静态资源，实际物理目录位置
   */
  readonly resourceLocations: Array<string>

  /**
   * 获取当前静态资源路径匹配规则列表
   */
  readonly pathPatterns: Array<string>

  resourceChainRegistration: ResourceChainRegistration

  /**
   * 设置当前静态资源的缓存配置
   */
  cacheControl: CacheControl

  /**
   * 构造一个静态资源注册信息。
   * @param pathPatterns 
   */
  constructor(pathPatterns: Array<string>) {
    this.resourceLocations = [];
    this.pathPatterns = pathPatterns || [];
  }

  /**
   * 添加静态资源搜索目录
   * 路径可以为：绝对路径，或者相对路径，当路径为相对路径时，相对于应用启动路径
   * ```js
   *  
   * // 路径: path.resolve('static/web')
   * addResourceLocations('static/web');
   * 
   * // 绝对路径:
   * addResourceLocations(path.resolve('static/web'));
   * 
   * ```
   */
  addResourceLocations(...resourceLocations: Array<string>) {
    this.resourceLocations.push(...resourceLocations);
    return this;
  }

  setCacheControl(options: CacheControl) {
    this.cacheControl = new CacheControl(options);
  }

  resourceChain(cacheResources,cache?){
    this.resourceChainRegistration = new ResourceChainRegistration(cacheResources,cache);
  }

}