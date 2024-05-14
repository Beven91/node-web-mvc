import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http2';
import RequestMappingInfo from '../servlets/mapping/RequestMappingInfo';
import MethodParameter from '../servlets/method/MethodParameter';

// 动作字典
export declare class ActionsMap {
  [propName: string]: ActionDescriptors
}

// 动作描述
export class ActionDescriptors {
  constructor() {
    this.params = [];
    this.annotations = [];
  }

  // 动作函数
  value: Function
  // 配置在控制器上的映射
  mapping: RequestMappingInfo
  // 当前action设置的返回状态
  responseStatus?: { reason: string, code: number }
  /**
   * 当前函数的参数配置
   */
  params?: Array<MethodParameter>
  /**
   * 当前动作的相关注解
   */
  annotations: Array<ActionAnnotation>
}

export declare class ActionAnnotation {
  ctor: Function
  options: any
}

export declare class DescriptorSwaggerMethods {
  [propName: string]: DescriptorSwaggerMethod
}

export declare class DescriptorSwaggerMethod {
  path: Array<string>
  doc: any
}

export declare class DescriptorSwagger {
  // 当前控制器描述，拥有的tags
  tags: Array<string>
  // 当前控制器的所有方法文档
  methods: DescriptorSwaggerMethods
}

// 控制器描述
export declare class ControllerDescriptors {
  // 对应的控制器类
  ctor: any
  // 控制器全局的produces
  produces?: string
  // 配置在控制器上的映射
  mapping: RequestMappingInfo
  // 所有接口的路由映射配置
  actions: ActionsMap
  // 当前控制器自定义的异常处理函数
  exceptionHandler: Function
  // 当前控制器的作用域
  scope: string
  // swagger配置
  swagger: DescriptorSwagger
}

declare type MiddlewareNext = (reason?: any) => void

export declare interface CrossOriginOption {
  origins: string
  allowCredentials: boolean
  allowedHeaders: string
  allowMethods: string
}

export type ClazzType = {
  new(): any
}

export type JsDataType = Function | (abstract new (...args: any[]) => any)

export declare type Middleware = (request: any, response: any, ex: MiddlewareNext) => void

export type HttpHeaderValue = number | string | ReadonlyArray<string>

export type ResponseHeaders = Record<string, HttpHeaderValue>

export type RequestHeaders = Record<string, HttpHeaderValue>