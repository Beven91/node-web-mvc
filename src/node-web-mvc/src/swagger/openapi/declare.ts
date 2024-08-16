import { MetaRuntimeTypeInfo } from '../../servlets/annotations/annotation/type';

export interface ApiTag {
  name: string

  description?: string

  externalDocs?: ExternalDocs
}

export interface ApiImplicitParamOptions {
  /**
   * 接口参数名称
   */
  name: string

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
  dataType?: any

  /**
   * 参数示例值，一定程度上可用于补充dataType
   */
  example?: any
}

export declare interface ExternalDocs {
  description: string,
  url: string
}

export interface OperationPath {
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

export interface ApiOperationPaths {
  [propName: string]: OperationPath
}

export interface ApiPaths {
  [propName: string]: ApiOperationPaths
}

export interface SchemeRef {
  $ref: string
}

export interface GenericTypeSchemeRefExt {
  refType: SchemeRef
  name: string
  runtimeType: MetaRuntimeTypeInfo
}

export interface ApiModelInfo {
  title: string
  name?: string
  description: string
  allOf?: Array<ApiModelInfo | SchemeRef>
  properties?: {
    [x: string]: ApiModelPropertyInfo | SchemeRef
  }
}

export interface ApiModelPropertyInfo {
  type: string
  items?: any
  format?: string
  title?: string
  enum?: string[]
  example?: any
  description?: string
  // 运行时类型，在输出到swagger会被移除
  runtimeType?: MetaRuntimeTypeInfo
  additionalProperties?: boolean | {
    [x: string]: ApiModelPropertyInfo
  }
}

export interface SchemaMeta {
  required?: string[]
  type: string
  properties?: {
    [x: string]: {
      description?: string
      format?: string
      items?: any
      type: string
    }
  }
}

export interface ApiOperationResponseBody {
  content: {
    [x: string]: {
      example?: string
      schema: SchemeRef | SchemaMeta
    }
  }
}

export interface DefinitionInfo {
  type?: string
  name: string
  items?: any
}

export interface ApiOperationParameter {
  name: string
  required: boolean
  description: string
  in: 'path' | 'query' | 'body' | 'header' | 'formData'
  example: string
  schema: SchemeRef | ApiModelPropertyInfo
}
