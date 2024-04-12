import DispatcherServlet from "../DispatcherServlet";
import type WebMvcConfigurationSupport from "../config/WebMvcConfigurationSupport";
import GenericApplicationContext from "../context/GenericApplicationContext";
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import ServletContext, { DrivedServletContextClazz } from "../http/ServletContext";
import Filter from "./Filter";
import FilterChain from "./FilterChain";

export default class ServletDispatchFilter implements Filter {

  private readonly dispatcher: DispatcherServlet

  private readonly contextClazz: DrivedServletContextClazz

  constructor(contextClazz: DrivedServletContextClazz, context: GenericApplicationContext) {
    this.dispatcher = new DispatcherServlet(context);
    this.contextClazz = contextClazz;
  }

  async doFilter(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain): Promise<void> {
    const ProxyHttpContext = this.contextClazz;
    const context: ServletContext = new ProxyHttpContext(request, response);
    await this.dispatcher.doService(context);
    chain.doFilter(request, response);
  }

}