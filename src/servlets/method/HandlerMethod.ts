/**
 * @module HandlerMethod
 * @description action执行器
 */
import ServletContext from '../http/ServletContext';
import ControllerManagement from '../../ControllerManagement';
import ServletModel from '../models/ServletModel';
import { ActionDescriptors } from '../../interface/declare';
import InterruptModel from '../models/InterruptModel';
import MethodParameter from '../../interface/MethodParameter';
import Javascript from '../../interface/Javascript';

declare class ParameterDictionary {
  [propName: string]: MethodParameter
}

export default class HandlerMethod {

  /**
   * 参数map形式
   */
  private paramsDictionary: ParameterDictionary

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
   * 获取指定名称的参数配置
   * @param name 
   */
  public getResolveParameter(name: string): MethodParameter {
    return this.paramsDictionary[name];
  }

  /**
   * 获取要执行函数的方法签名列表
   */
  public get signParameters(): Array<string> {
    return Javascript.resolveParameters(this.method)
  }

  /**
   * 对应controller实例
   */
  public get controller() {
    return this.servletContext.controller;
  }

  /**
   * 当前action定义的可解析参数配置
   */
  public get resolveParameters() {
    const descriptor = ControllerManagement.getControllerDescriptor(this.servletContext.Controller);
    const action = (descriptor.actions[this.servletContext.actionName] || {}) as ActionDescriptors
    return action.params || [];
  }

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
    this.paramsDictionary = {};
    this.resolveParameters.forEach((parameter) => {
      this.paramsDictionary[parameter.name || parameter.value] = parameter;
    });
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
   * 获取当前action设定的注解信息
   * 由于Javascript没有反射，所以这里仅返回控制器的所有标记属性
   * @param { Class } ctor 注解构造函数
   */
  public getMethodAnnotations(ctor?) {
    const descriptor = ControllerManagement.getControllerDescriptor(this.servletContext.Controller);
    if (!ctor) {
      return descriptor.actions[this.servletContext.actionName];
    }
  }

  /**
   * 执行方法
   */
  public async invoke(...args) {
    const { controller, action } = this.servletContext;
    const data = await action.call(controller, ...args);
    if (this.servletContext.isNextInvoked && data === undefined) {
      return new InterruptModel();
    }
    // 设置返回状态
    this.evaluateResponseStatus();
    // 返回结果
    return new ServletModel(data);
  }
}