/**
 * @module RedirectView
 * @description 重定向视图
 */
import querystring from 'querystring';
import View from './View';
import ControllerFactory from '../../ControllerFactory';
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import DispatcherServlet from '../DispatcherServlet';
import ForwardEndlessLoopError from '../../errors/ForwardEndlessLoopError';

export default class InternalResourceView extends View {

  render(model, request: HttpServletRequest, response: HttpServletResponse) {
    const url = new URL(this.url);
    const servletContext = request.servletContext;
    const isLoop = !!servletContext.forwardStacks.find((f)=>f === this.url);
    if(isLoop){
      // 如果循环跳转
      throw new ForwardEndlessLoopError(servletContext.forwardStacks);
    }
    // 添加跳转栈,用于检测是否循环跳转
    servletContext.forwardStacks.push(this.url);
    // 覆写参数
    request.path = url.pathname;
    request.host = url.hostname;
    request.query = {
      ...(request.query || {}),
      ...(querystring.parse((url.search||'').slice(1)))
    }
    const pathVariables = request.pathVariables || {};
    // 重新渲染上下文
    ControllerFactory.defaultFactory.createController(request.servletContext);
    // 合并pathVariables
    request.pathVariables = {
      ...pathVariables,
      ...(request.pathVariables || {})
    }
    // 重新执行
    return (new DispatcherServlet()).doService(request.servletContext)
  }
}