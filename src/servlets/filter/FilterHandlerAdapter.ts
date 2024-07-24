import { BeanFactory } from "../../ioc/factory/BeanFactory";
import RuntimeAnnotation from "../annotations/annotation/RuntimeAnnotation";
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import PathMatcher from "../util/PathMatcher";
import Filter from "./Filter";
import FilterChain from "./FilterChain";
import FilterRegistrationBean from "./FilterRegistrationBean";
import WebFilter from "./WebFilter";

export default class FilterHandlerAdapter {

  private readonly registrationBeans: FilterRegistrationBean[] = [];

  private readonly patchMatcher = new PathMatcher();

  constructor(beanFactory: BeanFactory) {
    const filters = beanFactory.getBeansOfType(Filter);
    for (const filter of filters) {
      const anno = RuntimeAnnotation.getClassAnnotation(filter.constructor, WebFilter);
      let urlPatterns = anno?.nativeAnnotation?.urlPatterns;
      if (urlPatterns && !(urlPatterns instanceof Array)) {
        urlPatterns = [urlPatterns].filter(Boolean)
      }
      this.addFilter(filter, urlPatterns as string []);
    }
  }

  public addFilter(filter: Filter, urlPatterns?: string[]) {
    const registration = new FilterRegistrationBean(filter);
    this.registrationBeans.push(registration);
    if (urlPatterns) {
      registration.setUrlPatterns(urlPatterns);
      // 预构建匹配模式缓存
      PathMatcher.preBuildPattern(urlPatterns);
    }
  }

  private matchFilters(request: HttpServletRequest) {
    const filters: Filter[] = [];
    const path = request.path;
    for (const registration of this.registrationBeans) {
      if (registration.isPatternsEmpty() || this.patchMatcher.matchOne(registration.urlPatterns, path)) {
        filters.push(registration.filter);
      }
    }
    return filters;
  }

  async doFilter(request: HttpServletRequest, response: HttpServletResponse) {
    const chain = new FilterChain(this.matchFilters(request));
    return chain.doFilter(request, response);
  }
}