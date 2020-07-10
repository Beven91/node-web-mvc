/**
 * @module MethodParameter
 * @description 请求参数配置类
 */

export class MethodParameterOptions {
  /**
   * 需要从请求中提取的参数名称
   */
  public value: string

  /**
   * 所在的参数名称
   */
  public name?:string

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

  private annotations?: Array<Function>

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  public paramType?: string

  /**
   * 判断当前参数是否存在指定注解
   */
  public hasParameterAnnotation(annotation): boolean {
    return !!this.annotations.find((a) => a === annotation);
  }

  /**
   * 
   * @param options 
   * @param paramType 
   */

  constructor(options, paramType?: string, annotation?: Function) {
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
    this.annotations = [annotation]
    this.paramType = this.paramType || paramType;
  }
}