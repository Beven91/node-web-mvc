import RouteMapping from '../routes/RouteMapping';
import MethodParameter from './MethodParameter';

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
  mapping: RouteMapping
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
  // 配置在控制器上的映射
  mapping: RouteMapping
  // 所有接口的路由映射配置
  actions: ActionsMap
  // 当前控制器自定义的异常处理函数
  exceptionHandler: Function
  // 当前控制器的作用域
  scope: string
  // swagger配置
  swagger: DescriptorSwagger
}