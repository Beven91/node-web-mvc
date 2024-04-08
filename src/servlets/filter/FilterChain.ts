import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import Filter from "./Filter";

export default class FilterChain {

  private readonly filters: Filter[]

  private currentIndex: number

  constructor(filters: Filter[]) {
    this.filters = filters;
    this.currentIndex = 0;
  }

  doFilter(request: HttpServletRequest, response: HttpServletResponse) {
    const filter = this.filters[this.currentIndex];
    filter?.doFilter?.(request, response, this);
    this.currentIndex = this.currentIndex + 1;
  }

}