import Filter from './Filter';


export default class FilterRegistrationBean {
  /**
   * 路由匹配配置
   */
  urlPatterns: string[];

  /**
   * 对应的过滤器
   */
  public readonly filter: Filter;

  constructor(filter: Filter) {
    this.filter = filter;
    this.urlPatterns = [];
  }

  /**
   * 判断匹配模式是否为空
   * @returns
   */
  isPatternsEmpty() {
    return this.urlPatterns?.length < 1;
  }

  /**
   * 追加过滤器匹配路径模式字符串
   * @param patterns
   */
  addUrlPatterns(...patterns: string[]) {
    this.urlPatterns.push(...patterns);
  }

  /**
   * 设置过滤器匹配路径模式字符串
   * @param patterns
   */
  setUrlPatterns(patterns: string[]) {
    this.urlPatterns = patterns;
  }
}
