import ServletContext from '../../http/ServletContext';
import ModelAndView from '../../models/ModelAndView';
import HandlerMethod from '../HandlerMethod';

export default interface HandlerExceptionResolver {
  /**
   * 用于尝试解决指定异常
   * @param servletContext 当前请求上下我呢
   * @param handler 当前出异常的handler
   * @param error  当前异常信息
   * @return { Promise<boolean> } 返回 true=表示已解决异常 false=标识没有解决异常
   */
  resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<ModelAndView>
}
