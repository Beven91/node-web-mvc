/**
 * @module MethodParameter
 * @description 请求参数配置类
 */

import RuntimeAnnotation, { IAnnotationClazz } from "../annotations/annotation/RuntimeAnnotation"

export type RequestParamType = 'path' | 'query' | 'body' | 'header' | 'form' | ''

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
   * 当前参数的所有注解
   */
  private annotations: RuntimeAnnotation[];

  /**
   * 判断当前参数是否存在指定注解
   */
  public hasParameterAnnotation<C extends IAnnotationClazz>(annotationType: C): boolean {
    return !!this.getParameterAnnotation(annotationType);
  }

  /**
   * 获取当前参数注解
   */
  public getParameterAnnotation<T extends IAnnotationClazz>(annotationType: T): InstanceType<T> {
    return this.annotations.find((m) => RuntimeAnnotation.isAnnotationTypeOf(m, annotationType))?.nativeAnnotation;
  }

  /**
   * 判断当前paramterType类型是否为指定类型（包含继承判定)
   */
  public isParamAssignableOf(parentType: { prototype: any }) {
    if (!parentType?.prototype) {
      return false;
    }
    // 判断 参数类型是否继承与parentType或者等于parentType
    return parentType === this.parameterType || parentType.prototype.isPrototypeOf(this.parameterType?.prototype);
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
    this.annotations = RuntimeAnnotation.getMethodParamAnnotations(beanType, method, paramName);
  }
}