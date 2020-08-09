export declare class ApiOptions {
  /**
   * 接口类描述 默认为class名
   */
  value?: string

  /**
   * 接口描述
   */
  description?: string

  /**
   * 接口标签 如果没有定义tags 则默认使用 value
   */
  tags?: Array<ApiTag>
}

export declare class ApiTag {
  name: string

  description?: string

}

export declare class ApiOperationOptions {

  /**
   * 具体接口方法的描述
   */
  value?: string

  /**
   * 接口详细描述
   */
  notes?: string

  /**
   * 当前接口方法的请求类型
   * 可选值有："GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS" and "PATCH"
   */
  httpMethod?

  // 返回数据类型
  returnType?: string

  /**
   * 返回http结果类型
   */
  code?
}

export declare class ApiImplicitParamOptions {
  /**
   * 接口参数名称
   */
  name?: string

  /**
   * 参数的简短描述
   */
  description?: string

  /**
   * 参数简短描述 同 description
   */
  value?: string

  /**
   * 是否为必传参数
   */
  required?: boolean

  /**
   * 参数的数据类型
   */
  dataType?: string

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  paramType?: 'path' | 'query' | 'body' | 'header' | 'form' | 'formData'
}

export declare class ApiModelOptions {
  /**
   * model的别名，默认为类名
   */
  value?: string

  /**
   * model的详细描述
   */
  description?: string
}

export declare class ApiModelPropertyOptions {
  /**
   * 属性简短描述
   */
  value: string

  /**
   * 属性的示例值
   */
  example?: string | number | Date | boolean | Object

  /**
   * 是否为必须值
   */
  required?: boolean

  /**
   * 数据类型
   */
  dataType?: string

  /**
   * 当前属性是否为泛型，且对应的泛型类型名
   */
  generic?: boolean
}

export declare class OperationPath {
  /**
   * 当前接口是否已废弃
   */
  deprecated: boolean
  /**
   * 当前接口函数名
   */
  operationId: string
  /**
   * 当前接口所属的控制器标签
   */
  tags: Array<string>
  /**
   * 当前接口描述
   */
  summary: string
  /**
   * 当前接口参数
   */
  parameters: any
  /**
   * 当前接口返回类型
   */
  responses: any
}

export declare class OperationPathMap {
  [propName: string]: OperationPath
}

export declare class OperationsDoc {
  [propName: string]: OperationPathMap
}

export declare class ApiOperationParamMeta {
  /**
   * 参数名称
   */
  name: string
  /**
   * 参数是否必填
   */
  required: boolean
  /**
   * 参数描述
   */
  description: string
  /**
   * 参数来源类型
   */
  in: string

  /**
   * 参数原始数据类型
   */
  dataType: string

  /**
   * 参数值类型
   */
  type: string

  /**
   * 参数引用类型定义
   */
  schema: {
    $ref: string,
  }

  items?: {
    $ref: string
  }
}

export declare class ApiModelPropertyMetaMap {
  [propName: string]: ApiModelPropertyMeta
}

export declare class ApiModelPropertyMeta {
  generic?: boolean
  description: string
  required: boolean
  example: any
  type: string
}

export declare class ApiModelMeta {
  title: string
  name?: string
  description: string
  ctor: Function
  properties: ApiModelPropertyMetaMap
}

export declare class ApiOperationMeta {
  method: string
  api: ApiMeta
  consumes: Array<string>
  option?: ApiOperationOptions
  parameters: Array<ApiOperationParamMeta>
}

export declare class ApiMeta {
  class: Function
  option?: ApiOptions
  operations: Array<ApiOperationMeta>
}

export declare class DefinitionInfo {
  type?: string
  name: string
  items?: any
}