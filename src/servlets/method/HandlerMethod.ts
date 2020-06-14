/**
 * @module HandlerMethod
 * @description action执行器
 */
import ServletContext from '../ServletContext';
import ControllerManagement from '../../ControllerManagement';
import ServletModel from '../../models/ServletModel';
import InterruptModel from '../../models/InterruptModel';

export default class HandlerMethod {

  /**
   * 当前请求上下文
   */
  private servletContext: ServletContext;

  /**
   * 对应的action
   */
  public get method() {
    return this.servletContext.action;
  }

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
    const actionDescriptor = this.getMethodAnnotations();
    const annotation = actionDescriptor.responseStatus;
    if (annotation != null) {
      this.responseStatus = annotation.code;
      this.responseStatusReason = annotation.reason;
    }
  }

  /**
   * 获取当前action设定的标注信息
   * 由于Javascript没有反射，所以这里仅返回控制器的所有标记属性
   */
  public getMethodAnnotations() {
    const descriptor = ControllerManagement.getControllerDescriptor(this.servletContext.Controller);
    return descriptor.actions[this.servletContext.actionName];
  }

  /**
   * 执行方法
   */
  public invoke() {
    const { controller, request, response, action } = this.servletContext;
    let runtime = null;
    const next = (error) => (runtime = { error });
    const res = action.call(controller, request, response, next);
    return Promise.resolve(res).then((data) => {
      if (runtime) {
        return runtime.error ? Promise.reject(runtime.error) : new InterruptModel();
      }
      // 设置返回状态
      this.evaluateResponseStatus();
      // 返回数据
      return new ServletModel(data);
    })
  }
}