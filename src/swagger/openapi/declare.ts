export declare class ApiOptions {
  /**
   * 接口类描述 默认为class名
   */
  value: string

  /**
   * 接口标签 如果没有定义tags 则默认使用 value
   */
  tags?: Array<string>
}

export declare class ApiOperationOptions {

  /**
   * 具体接口方法的描述
   */
  value: string

  /**
   * 接口详细描述
   */
  notes: string

  /**
   * 当前接口方法的请求类型
   * 可选值有："GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS" and "PATCH"
   */
  httpMethod

  /**
   * 返回http结果类型
   */
  code
}

export declare class ApiImplicitParamOptions {
  /**
   * 接口参数名称
   */
  name: string
  /**
   * 参数的简短描述
   */
  value: string

  /**
   * 是否为必传参数
   */
  required: boolean

  /**
   * 参数的数据类型
   */
  dataType: string

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  paramType: string
}

export declare class ApiModelOptions {
  /**
   * model的别名，默认为类名
   */
  value: string

  /**
   * model的详细描述
   */
  description: string
}

export declare class ApiModelPropertyOptions {
  /**
   * 属性简短描述
   */
  value: string

  /**
   * 属性的示例值
   */
  example: string

  /**
   * 是否为必须值
   */
  required: boolean
}