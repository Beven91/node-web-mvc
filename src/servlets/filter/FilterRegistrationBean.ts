import Filter from "./Filter"


export default class FilterRegistrationBean {

  /**
   * 路由匹配配置
   */
  pattern: string[]

  /**
   * 对应的过滤器
   */
  filter: Filter

}