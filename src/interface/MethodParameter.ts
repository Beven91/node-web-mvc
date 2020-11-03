/**
 * @module MethodParameter
 * @description 请求参数配置类
 */

import RuntimeAnnotation, { AnnotationFunction } from "../servlets/annotations/annotation/RuntimeAnnotation"

export class MethodParameterOptions {
  /**
   * 需要从请求中提取的参数名称
   */
  public value?: string

  /**
   * 所在的参数名称
   */
  public name?: string

  /**
   * 当前参数的描述信息
   */
  public desc?: string

  /**
  * 参数是否必须传递 默认值为 true
  */
  public required?: boolean

  /**
   * 参数默认值,如果设置了默认值，则会忽略 required = true
   */
  public defaultValue?: any

  /**
   * 参数的数据类型
   */
  public dataType?: Function

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  public paramType?: string
}

export default class MethodParameter extends MethodParameterOptions {

  /**
   * 注解
   */
  private annotation: RuntimeAnnotation

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  public paramType?: string

  public get ctor() {
    return this.annotation.ctor;
  }

  /**
   * 判断当前参数是否存在指定注解
   */
  public hasParameterAnnotation(ctor: AnnotationFunction<any>): boolean {
    return !!RuntimeAnnotation.getNativeAnnotation(this.annotation, ctor);
  }

  /**
   * 获取当前参数注解
   */
  public getParameterAnnotation<T>(): T {
    return this.annotation ? this.annotation.nativeAnnotation as T : null;
  }

  /**
   * 构造一个方法参数
   * @param options 参数配置
   * @param paramType 参数类型
   * @param annotation 所属原始注解
   */
  constructor(options, paramType?: string, annotation?: RuntimeAnnotation) {
    super();
    if (options instanceof MethodParameter) {
      return options;
    } else if (typeof options === 'string') {
      this.value = options;
    } else if (options) {
      this.value = options.value;
      this.desc = options.desc;
      this.required = options.required;
      this.name = options.name;
      this.dataType = options.dataType;
      this.defaultValue = options.defaultValue;
      this.paramType = options.paramType;
    }
    this.annotation = annotation;
    this.paramType = this.paramType || paramType;
  }
}