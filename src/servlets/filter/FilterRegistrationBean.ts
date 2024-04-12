import Filter from "./Filter"


export default class FilterRegistrationBean {

  /**
   * 路由匹配配置
   */
  urlPatterns: string[]

  /**
   * 对应的过滤器
   */
  public readonly filter: Filter

  constructor(filter: Filter) {
    this.filter = filter;
    this.urlPatterns = [];
  }

  isPatternsEmpty(){
    return this.urlPatterns?.length < 1;
  }

  addUrlPatterns(...patterns: string[]) {
    this.urlPatterns.push(...patterns);
  }

  setUrlPatterns(patterns: string[]) {
    this.urlPatterns = patterns;
  }
}