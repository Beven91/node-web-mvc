import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import Filter from "./Filter";
import FilterChain from "./FilterChain";

export default class FilterHandlerAdapter {

  private readonly filters: Filter[] = [];

  private addFilter(filter: Filter) {
    this.filters.push(filter);
  }

  doFilter(request: HttpServletRequest, response: HttpServletResponse) {
    const chain = new FilterChain(this.filters);
    return chain.doFilter(request, response);
  }
}