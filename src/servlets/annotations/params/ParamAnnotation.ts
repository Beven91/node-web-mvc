import { RequestParamType } from "../../method/MethodParameter"

export default class ParamAnnotation {
  private paramAt: RequestParamType

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

  /**
   * 用于生成文档，表示参数应该在http协议的内容位置
   */
  public getParamAt() {
    return this.paramAt;
  }

  constructor(paramAt: RequestParamType) {
    this.paramAt = paramAt;
  }
}