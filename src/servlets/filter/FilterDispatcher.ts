import DispatcherServlet from '../DispatcherServlet';
import GenericApplicationContext from '../context/GenericApplicationContext';
import HttpServletRequest from '../http/HttpServletRequest';
import HttpServletResponse from '../http/HttpServletResponse';
import ServletContext from '../http/ServletContext';
import Filter from './Filter';
import FilterChain from './FilterChain';

export default class FilterDispatcher implements Filter {
  private readonly dispatcher: DispatcherServlet;

  constructor(context: GenericApplicationContext) {
    this.dispatcher = new DispatcherServlet(context);
  }

  async doFilter(request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain): Promise<void> {
    const context: ServletContext = new ServletContext(request, response);
    await this.dispatcher.doService(context);
    chain.doFilter(request, response);
  }
}
