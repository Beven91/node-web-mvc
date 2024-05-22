import { RequestParamType } from "../../method/MethodParameter"

const paramAtSymbol = Symbol('paramAt');

export default class ParamAnnotation {
  /**
   * 需要提取的参数名称,默认为：注解目标形参参数名
   */
  public value?: string

  /**
   * 参数是否必填
   */
  public required?: boolean = true

  /**
   * 默认值
   */
  public defaultValue?: any

  public get paramAt(): RequestParamType {
    return this[paramAtSymbol];
  }

  constructor(paramAt: RequestParamType) {
    this[paramAtSymbol] = paramAt;
  }
}