import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import { IDispatcher } from "../http/IDispatcher";
import Filter from "./Filter";
import FilterChain from "./FilterChain";

export default class ServletDispatchFilter implements Filter {

  private readonly dispatcher: IDispatcher

  constructor(dispatcher: IDispatcher) {
    this.dispatcher = dispatcher;
  }

  doFilter(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain): void {

  }

}