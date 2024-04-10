import querystring from 'querystring';
import { RequestDispatcher } from './RequestDispatcher';
import FilterHandlerAdapter from '../filter/FilterHandlerAdapter';
import HttpServletRequest from './HttpServletRequest';
import HttpServletResponse from './HttpServletResponse';
import ForwardEndlessLoopError from '../../errors/ForwardEndlessLoopError';

export default class ApplicationDispatcher implements RequestDispatcher {

  private readonly filterAdapter: FilterHandlerAdapter

  private path: string

  private query: string

  private url: string

  constructor(filterAdapter: FilterHandlerAdapter, url: string) {
    this.url = String(url);
    const [path, query] = this.url.split('?');
    this.path = path;
    this.query = query;
    this.filterAdapter = filterAdapter;
  }

  forward(request: HttpServletRequest, response: HttpServletResponse) {
    const servletContext = request.servletContext;
    const isLoop = !!servletContext.forwardStacks.find((f) => f === this.url);
    if (isLoop) {
      // 如果循环跳转
      throw new ForwardEndlessLoopError(servletContext.forwardStacks);
    }
    // 添加跳转栈,用于检测是否循环跳转
    servletContext.forwardStacks.push(this.url);
    return this.processRequest(request, response);
  }

  private processRequest(request: HttpServletRequest, response: HttpServletResponse) {
    const origin = new URL(request.path, 'http://localhost');
    const originPath = origin.pathname;
    const isRelative = this.path[0] !== '/';
    const idx = originPath.lastIndexOf('/');
    const pathName = isRelative ? originPath.slice(0, idx) + '/' + this.path : this.path;
    // 覆写参数
    request.path = pathName;
    request.query = {
      ...(request.query || {}),
      ...(querystring.parse((this.query || '').slice(1)))
    }
    request.pathVariables = {}
    return this.filterAdapter.doFilter(request, response);
  }
}