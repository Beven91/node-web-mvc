/**
 * @module HandlerMethod
 * @description action执行器
 */
import MethodParameter from './MethodParameter';
import Javascript from '../../interface/Javascript';
import RuntimeAnnotation, { IAnnotation } from '../annotations/annotation/RuntimeAnnotation';
import ResponseStatus from '../annotations/ResponseStatus';
import DefaultListableBeanFactory from '../../ioc/DefaultListableBeanFactory';
import BeanFactory from '../../ioc/BeanFactory';
import InterruptModel from '../models/InterruptModel';
import HandlerMethodReturnValueHandlerComposite from './return/HandlerMethodReturnValueHandlerComposite';
import ServletContext from '../http/ServletContext';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';

export interface BeanTypeClazz {
  new(...args: any[]): any
}

export default class HandlerMethod {

  private isBeanType: boolean

  public supportThisMethod: boolean

  /**
   * 对应的action
   */
  private readonly method: Function;

  // bean创建工厂
  private readonly beanFactory: BeanFactory

  public readonly methodName: string

  public get beanTypeName() {
    return this.beanType ? this.beanType.name : '';
  }

  /**
   * 当前bean的类型
   */
  public readonly beanType: BeanTypeClazz

  /**
   * 对应controller实例
   */
  public readonly bean: any

  // 当前函数，参数列表
  public readonly parameters: Array<MethodParameter>

  /**
   * 调用当前方法的参数值
   */
  public argumentValues: any[]

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
   * 构造一个方法执行器
   */
  constructor(bean: any, method: Function | HandlerMethod) {
    this.supportThisMethod = true;
    if (method instanceof HandlerMethod) {
      const handler = method as HandlerMethod;
      this.isBeanType = handler.isBeanType;
      this.method = handler.method;
      this.methodName = handler.methodName;
      this.bean = bean;
      this.beanType = bean.constructor;
      this.beanFactory = handler.beanFactory;
      this.parameters = handler.parameters;
      this.responseStatus = handler.responseStatus;
      this.responseStatusReason = handler.responseStatusReason;
    } else {
      const isType = typeof bean === 'function';
      this.isBeanType = isType;
      this.method = method;
      this.methodName = method ? method.name : '@@handler@@';
      this.bean = isType ? null : bean;
      this.beanType = isType ? bean : bean.constructor;
      this.beanFactory = DefaultListableBeanFactory.getInstance();
      this.parameters = this.initMethodParameters();
      this.evaluateResponseStatus();
    }
  }

  // 初始化参数
  private initMethodParameters(): Array<MethodParameter> {
    const methodAnno = RuntimeAnnotation.getMethodAnnotations(this.beanType, this.methodName)[0];
    const parameterNames = methodAnno?.parameters || Javascript.resolveParameters(this.method);
    return parameterNames.map((paramName, i) => {
      const dataType = methodAnno?.paramTypes?.[i];
      return new MethodParameter(this.beanType, this.methodName, paramName, i, dataType);
    });
  }

  /**
   * 从 ResponseStatus 获取当前action设定的返回状态，如果没有获取到则使用默认的
   */
  private evaluateResponseStatus(): void {
    const annotation = this.getAnnotation(ResponseStatus);
    if (annotation != null) {
      this.responseStatus = annotation.code;
      this.responseStatusReason = annotation.reason;
    }
  }

  /**
   * 获取当前方法上的指定注解信息
   * @param { Annotation } annotationType 要获取的注解类型类
   */
  public getAnnotation<T extends IAnnotation>(annotationType: T) {
    return this.getMethodAnnotation<T>(annotationType);
  }

  /**
   * 获取当前方法上的指定注解信息
   * @param { Annotation } annotationType 要获取的注解类型类
   */
  public getMethodAnnotation<T extends IAnnotation>(annotationType: T) {
    return RuntimeAnnotation.getMethodAnnotation(this.beanType, this.methodName, annotationType).nativeAnnotation;
  }

  /**
   * 获取当前方法所在类的指定类注解信息
   * @param annotationType 要获取的类注解类型类
   */
  public getClassAnnotation<T extends IAnnotation>(annotationType: T) {
    return RuntimeAnnotation.getClassAnnotation(this.beanType, annotationType)?.nativeAnnotation;
  }

  /**
   * 判定当前方法是否存在指定类型的注解
   */
  public hasMethodAnnotation<T extends IAnnotation>(annotationType: T) {
    return !!this.getMethodAnnotation(annotationType);
  }

  public createWithResolvedBean() {
    if (!this.isBeanType) {
      return new HandlerMethod(this.bean, this);
    }
    const bean = this.beanFactory.getBeanOfType(this.beanType);
    return new HandlerMethod(bean, this);
  }

  /**
   * 执行方法
   */
  public async invoke(servletContext: ServletContext, ...args: any[]) {
    if (!this.method) {
      return new InterruptModel();
    }
    const returnValue = this.method.call(this.bean, ...args);
    const returnType = new MethodParameter(this.beanType, this.methodName, '', -1, returnValue?.constructor);
    const configHandlers = WebMvcConfigurationSupport.configurer.returnValueRegistry.handlers;
    const returnHandlers = new HandlerMethodReturnValueHandlerComposite(configHandlers);
    returnHandlers.handleReturnValue(returnValue, returnType, servletContext, this);
    return returnValue;
  }
}