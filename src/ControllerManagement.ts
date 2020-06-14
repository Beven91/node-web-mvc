/**
 * @module ControllerManagement
 * @description 控制器scope管理
 */
import Javascript from './interface/Javascript';
import ServletContext from './servlets/ServletContext';
import RouteMapping from './routes/RouteMapping';

// 动作字典
export declare class ActionsMap {
  [propName: string]: ActionDescriptors
}

// 动作描述
export declare class ActionDescriptors {
  // 动作函数
  value: Function
  // 配置在控制器上的映射
  mapping: RouteMapping
  // 当前action设置的返回状态
  responseStatus?: { reason: string, code: number }
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
  swagger: any
}

const runtime = {
  // 控制器作用域控制存储器
  scopeControllers: {
    // 单例控制器实例
    singleton: [],
    // 多例控制器实例，多例控制器不做存储
    'prototype': null
  },
  // 控制器特征属性
  allControllerDescriptors: ([]) as Array<ControllerDescriptors>,
  // 当前设定的全局控制器处理实例
  controllerAdviceInstance: null,
}

export default class ControllerManagement {

  // 设定全局控制器处理实例
  static set controllerAdviceInstance(value) {
    const instance = runtime.controllerAdviceInstance;
    if (instance) {
      throw new Error('There has multiple @ControllerAdvice @' + instance.constructor.name + ' @' + value.constructor.name);
    }
    runtime.controllerAdviceInstance = value;
  }

  // 获取设置的controlleradvice
  static get controllerAdviceInstance() {
    return runtime.controllerAdviceInstance;
  }

  /**
   * 获取控制器的所有特征属性
   * @param {ControllerClass} ctor 
   */
  static getControllerDescriptor(ctor) {
    const allControllerDescriptors = runtime.allControllerDescriptors;
    let controllerDescriptors = allControllerDescriptors.find((attr) => attr.ctor === ctor);
    if (!controllerDescriptors) {
      controllerDescriptors = { ctor: ctor, actions: {} } as ControllerDescriptors;
      allControllerDescriptors.push(controllerDescriptors);
    }
    return controllerDescriptors;
  }

  /**
   * 存放scope控制器实例
   * @param {*} scope 作用域
   * @param {Controller} instance 控制器实例 
   */
  static addScopeController(scope, controller) {
    const container = runtime.scopeControllers[scope];
    if (container) {
      const addable = !container.find((instance) => instance === controller);
      addable ? container.push(controller) : undefined;
    }
  }

  /**
   * 创建一个控制器实例
   * @param {ControllerContext} servletContext 创建上下文参数
   */
  static createController(servletContext: ServletContext) {
    const { Controller } = servletContext;
    if (typeof Controller !== 'function') {
      return null;
    }
    const descriptor = this.getControllerDescriptor(Controller);
    const scope = descriptor.scope || 'singleton';
    const container = runtime.scopeControllers[scope] || [];
    let controller = container.find((instance) => instance.constructor === Controller);
    if (!controller) {
      controller = new Controller();
      this.addScopeController(scope, controller);
    }
    return controller;
  }

  /**
   * 创建当前controller对应的action
   * @param {*} controller 
   * @param {*} actionName 
   */
  static creatAction(controller, actionName) {
    if (!controller) {
      return null;
    } else if (typeof actionName === 'function') {
      return actionName;
    } else {
      const actions = this.initializeControllerActions(controller);
      return (actions[actionName] || {}).value;
    }
  }

  static initializeControllerActions(controller) {
    const Controller = controller.constructor;
    const descriptor = ControllerManagement.getControllerDescriptor(Controller);
    if (!descriptor.actions) {
      const actions = descriptor.actions = {} as ActionsMap;
      const actionNames = Reflect.ownKeys(controller.__proto__).filter((key) => !Javascript.protoKeys[key]);
      actionNames.forEach((key: string) => {
        actions[key] = {
          value: Controller.prototype[key],
          mapping: new RouteMapping(Controller.name + '/' + key, '', null, null, null, null),
        } as ActionDescriptors
      })
    }
    return descriptor.actions;
  }
}