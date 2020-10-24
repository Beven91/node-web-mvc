/**
 * @module ResourceHandlerRegistry
 * @description 静态资源注册表
 */
import ResourceHandlerRegistration from './ResourceHandlerRegistration';
import ResourceHandlerMapping from './ResourceHandlerMapping';
import ResourceHttpRequestHandler from './ResourceHttpRequestHandler';

export default class ResourceHandlerRegistry {

  /**
    * 添加一个静态服务资源
    * @param ...pathPatterns 
    * 路径规则样例:  "/static/**" 或者 "/css/{filename:\\w+\\.css}"。
    */
  static addResourceHandler(...pathPatterns: Array<string>) {
    const registration = new ResourceHandlerRegistration(pathPatterns);
    ResourceHandlerMapping.getInstance().registerHandlerMethod('resource', registration, new ResourceHttpRequestHandler(registration))
    return registration;
  }
}