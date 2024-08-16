/**
 * @module HandlerMethod
 * @description action执行器
 */
import MethodParameter from './MethodParameter';
import Javascript from '../../interface/Javascript';
import RuntimeAnnotation from '../annotations/annotation/RuntimeAnnotation';
import ResponseStatus from '../annotations/ResponseStatus';
import { BeanFactory } from '../../ioc/factory/BeanFactory';
import { ClazzType } from '../../interface/declare';
import { IAnnotation } from '../annotations/annotation/type';

export interface BeanTypeClazz {
  new(...args: any[]): any
}

export default class HandlerMethod {
  private isBeanType: boolean;

  public readonly beanFactory: BeanFactory;

  /**
   * 对应的action
   */
  public readonly method: Function;

  public readonly methodName: string;

  public get beanTypeName() {
    return this.beanType ? this.beanType.name : '';
  }

  /**
   * 当前bean的类型
   */
  public readonly beanType: BeanTypeClazz;

  /**
   * 对应controller实例
   */
  public readonly bean: any;

  // 当前函数，参数列表
  public readonly parameters: Array<MethodParameter>;

  /**
   * 调用当前方法的参数值
   */
  public argumentValues: any[];

  /**
   * 当前请求返回的状态码
   */
  public responseStatus: number;

  /**
   * 当前状态码产生的原因
   */
  public responseStatusReason: string;

  public readonly resolvedFromHandlerMethod: HandlerMethod;

  /**
   * 构造一个方法执行器
   */
  constructor(bean: InstanceType<BeanTypeClazz>, method: Function);
  constructor(bean: InstanceType<BeanTypeClazz>, method: HandlerMethod);
  constructor(beanType: ClazzType, method: Function, beanFactory?: BeanFactory);
  constructor(bean: InstanceType<BeanTypeClazz> | ClazzType, method: Function | HandlerMethod, beanFactory?: BeanFactory) {
    if (method instanceof HandlerMethod) {
      const handler = method as HandlerMethod;
      this.isBeanType = handler.isBeanType;
      this.method = handler.method;
      this.methodName = handler.methodName;
      this.bean = bean;
      this.beanType = bean.constructor;
      this.parameters = handler.parameters;
      this.beanFactory = method.beanFactory;
      this.responseStatus = handler.responseStatus;
      this.responseStatusReason = handler.responseStatusReason;
      this.resolvedFromHandlerMethod = method;
    } else {
      const isType = typeof bean === 'function' || typeof bean === 'string';
      this.isBeanType = isType;
      this.method = method;
      this.methodName = method ? method.name : '@@handler@@';
      this.bean = isType ? null : bean;
      this.beanType = isType ? bean : bean.constructor;
      this.parameters = this.initMethodParameters();
      this.beanFactory = beanFactory;
      this.evaluateResponseStatus();
    }
  }

  // 初始化参数
  private initMethodParameters(): Array<MethodParameter> {
    // TODO: 确保有底层注解
    const methodAnno = RuntimeAnnotation.getMethodAnnotations(this.beanType, this.methodName)[0];
    const parameterNames = methodAnno?.parameters || Javascript.resolveParameters(this.method);
    return parameterNames.map((paramName, i) => {
      const dataType = methodAnno?.paramTypes?.[i];
      return new MethodParameter(this.beanType, this.methodName, paramName, i, dataType);
    });
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
    return RuntimeAnnotation.getMethodAnnotation(this.beanType, this.methodName, annotationType)?.nativeAnnotation;
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
    const bean = this.beanFactory.getBean(this.beanType);
    return new HandlerMethod(bean, this);
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
}
