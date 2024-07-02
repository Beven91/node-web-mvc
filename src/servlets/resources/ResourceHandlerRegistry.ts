/**
 * @module ResourceHandlerRegistry
 * @description 静态资源注册表
 */
import PathMatcher from '../util/PathMatcher';
import ResourceHandlerRegistration from './ResourceHandlerRegistration';

export default class ResourceHandlerRegistry {

  public registrations = [] as ResourceHandlerRegistration[];


  /**
   * 添加一个静态服务资源
   * @param ...pathPatterns 
   * 路径规则样例:  "/static/**" 或者 "/css/{filename:\\w+\\.css}"。
   */
  addResourceHandler(...pathPatterns: Array<string>) {
    const registration = new ResourceHandlerRegistration(pathPatterns);
    PathMatcher.preBuildPattern(pathPatterns);
    this.registrations.push(registration);
    return registration;
  }
}