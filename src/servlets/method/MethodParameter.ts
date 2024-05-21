/**
 * @module MethodParameter
 * @description 请求参数配置类
 */

import Javascript from "../../interface/Javascript"
import RuntimeAnnotation, { IAnnotationClazz } from "../annotations/annotation/RuntimeAnnotation"

export type RequestParamType = 'path' | 'query' | 'body' | 'header' | 'form' | 'part'  | ''

export default class MethodParameter {

  /**
   * 当前参数所属函数
   */
  public readonly method: string

  /**
   * 当前参数所属函数对应的类
   */
  public readonly beanType: Function

  /**
   * 参数名称
   */
  public readonly paramName: string

  /**
   * 参数所在函数签名下标
   */
  public readonly paramIndex: number

  /**
   * 参数类型
   */
  public readonly parameterType: any

  /**
   * 判断当前参数是否存在指定注解
   */
  public hasParameterAnnotation<C extends IAnnotationClazz>(annotationType: C): boolean {
    return !!this.getParameterAnnotation(annotationType);
  }

  public hasClassAnnotation<C extends IAnnotationClazz>(annotationType: C): boolean {
    return !!RuntimeAnnotation.getClassAnnotation(this.beanType, annotationType);
  }

  public hasMethodAnnotation<C extends IAnnotationClazz>(annotationType: C): boolean {
    return !!RuntimeAnnotation.getMethodAnnotation(this.beanType, this.method, annotationType);
  }

  /**
   * 获取当前参数注解
   */
  public getParameterAnnotation<T extends IAnnotationClazz>(annotationType: T) {
    return RuntimeAnnotation.getMethodParamAnnotation(this.beanType, this.method, this.paramName, annotationType)?.nativeAnnotation;
  }

  /**
   * 判断当前paramterType类型是否为指定类型（包含继承判定)
   */
  public isParamAssignableOf(parentType: Function) {
    if (!parentType) return false;
    // 判断 参数类型是否继承与parentType或者等于parentType
    return Javascript.createTyper(this.parameterType).isType(parentType);
  }

  /**
   * 构造一个方法参数
   * @param options 参数配置
   * @param paramType 参数类型
   * @param annotation 所属原始注解
   */
  constructor(beanType: Function, method: string, paramName: string, paramIndex: number, parameterType: any) {
    this.beanType = beanType;
    this.method = method;
    this.paramName = paramName;
    this.paramIndex = paramIndex;
    this.parameterType = parameterType;
  }
}