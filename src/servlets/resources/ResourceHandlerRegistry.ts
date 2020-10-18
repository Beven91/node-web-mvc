/**
 * @module ResourceHandlerRegistry
 * @description 静态资源注册表
 */
import ResourceHandlerRegistration from './ResourceHandlerRegistration';

// 所有注册的静态资源注册集合
const registrations: Array<ResourceHandlerRegistration> = [];

export default class ResourceHandlerRegistry {

  private readonly registrations: Array<ResourceHandlerRegistration>;

  constructor() {
    this.registrations = [];
  }

  /**
    * 添加一个静态服务资源
    * @param ...pathPatterns 
    * 路径规则样例:  "/static/**" 或者 "/css/{filename:\\w+\\.css}"。
    */
  addResourceHandler(...pathPatterns: Array<string>) {
    const registration = new ResourceHandlerRegistration(pathPatterns);
    this.registrations.push(registration);
    return registration;
  }

  getHandlerMapping() {
    if (this.registrations.length < 1) {
      return null;
    }

    for(let registration of this.registrations){
      for(let pathPattern of registration.pathPatterns){
        
      }
    }
  }
}