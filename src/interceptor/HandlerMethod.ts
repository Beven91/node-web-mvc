/**
 * @module HandlerMethod
 * @description action执行器
 */
import ServletContext from '../servlets/ServletContext';
import ControllerManagement from '../ControllerManagement';

export default class HandlerMethod {

  /**
   * 当前请求上下文
   */
  private servletContext: ServletContext;


  /**
   * 当前action定义的参数
   * TODO: 这里在js环境没法获取参数类型，先暂时不实现
   */
  public parameters: Array<any>;

  /**
   * 当前请求返回的状态码
   */
  public responseStatus: number

  /**
   * 当前状态码产生的原因，
   * TODO: 这里不进行实现
   */
  public responseStatusReason: string

  /**
   * 构造一个action执行器
   * @param servletContext 
   */
  constructor(servletContext: ServletContext) {
    this.servletContext = servletContext;
  }

  /**
   * 从 ResponseStatus 获取当前action设定的返回状态，如果没有获取到则使用默认的
   */
  private evaluateResponseStatus(): void {
    const attrs = this.getMethodAnnotation();
    const annotation = attrs.responseStatus;
    if (annotation != null) {
      this.responseStatus = annotation.code;
      this.responseStatusReason = annotation.reason;
    }
  }

  /**
   * 获取当前action设定的标注信息
   * 由于Javascript没有反射，所以这里仅返回控制器的所有标记属性
   */
  public getMethodAnnotation() {
    return ControllerManagement.getControllerAttributes(this.servletContext.controllerClass);
  }

  /**
   * 执行action
   */
  invoke() {
    const { controller, request, response, action } = this.servletContext;
    const res = action.call(controller, request, response);
    return Promise.resolve(res).then((data) => {
      // 设置返回状态
      this.evaluateResponseStatus();
      // 返回数据
      return data;
    })
  }

}