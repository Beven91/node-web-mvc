import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import Filter from "./Filter";
import FilterChain from "./FilterChain";

export default class FilterHandlerAdapter {

  private readonly filters: Filter[] = [];

  public addFilter(filter: Filter) {
    this.filters.push(filter);
  }

  async doFilter(request: HttpServletRequest, response: HttpServletResponse) {
    const chain = new FilterChain(this.filters);
    return chain.doFilter(request, response);
  }
}