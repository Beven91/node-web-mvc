/**
 * @module HandlerMethod
 * @description action执行器
 */
import ServletContext from '../http/ServletContext';
import ServletModel from '../models/ServletModel';
import InterruptModel from '../models/InterruptModel';
import MethodParameter from '../../interface/MethodParameter';
import Javascript from '../../interface/Javascript';
import RuntimeAnnotation, { AnnotationFunction } from '../annotations/annotation/RuntimeAnnotation';
import Middlewares from '../models/Middlewares';
import ResponseStatus, { ResponseStatusAnnotation } from '../annotations/ResponseStatus';

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
  public get resolveParameters(): Array<MethodParameter> {
    const { Controller, actionName } = this.servletContext;
    return RuntimeAnnotation.getMethodParamAnnotations(Controller, actionName).map((annotation) => {
      const name = annotation.nativeAnnotation.constructor.name;
      return annotation.nativeAnnotation.param || new MethodParameter({ value: annotation.paramName }, name, annotation)
    })
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
    const annotation = this.getAnnotation<ResponseStatusAnnotation>(ResponseStatus);
    if (annotation != null) {
      this.responseStatus = annotation.code;
      this.responseStatusReason = annotation.reason;
    }
  }

  /**
   * 获取当前方法上的指定注解信息
   * @param { Annotation } annotationClass 注解类
   */
  public getAnnotation<T>(ctor: AnnotationFunction<any>) {
    const annotations = RuntimeAnnotation.getMethodAnnotations(this.servletContext.Controller, this.servletContext.actionName);
    return RuntimeAnnotation.getNativeAnnotation<T>(annotations, ctor);
  }

  /**
   * 执行方法
   */
  public async invoke(...args) {
    const { controller, action, request, response } = this.servletContext;
    let data = await action.call(controller, ...args);
    if (data instanceof Middlewares) {
      data = await data.execute(request, response)
    }
    if (this.servletContext.isNextInvoked && data === undefined) {
      return new InterruptModel();
    }
    // 设置返回状态
    this.evaluateResponseStatus();
    // 返回结果
    return new ServletModel(data);
  }
}