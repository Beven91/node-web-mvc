/**
 * @module ControllerManagement
 * @description 控制器scope管理
 */
import Javascript from './interface/Javascript';
import ServletContext from './servlets/http/ServletContext';
import RouteMapping from './routes/RouteMapping';
import { ControllerDescriptors, ActionsMap, ActionDescriptors } from './interface/declare';
import hot from './hot';

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
   * 获取指定控制器下指定名称的action描述信息
   * @param {ControllerClass} ctor 
   */
  static getActionDescriptor(ctor, name): ActionDescriptors {
    const descriptor = ControllerManagement.getControllerDescriptor(ctor);
    const actions = descriptor.actions;
    if (!actions[name]) {
      actions[name] = ({ params: [] } as ActionDescriptors);
    }
    const action = actions[name];
    if (!action.params) {
      action.params = [];
    }
    return action;
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

/**
 * 内部热更新实现
 **/
hot.create(module).preend((old) => {
  /**
   * 预更新时：执行以下几件事情:
   * 1. 如果当前热更新的模块是一个控制器，则删除该控制器以及对应scope实例。
   * 2. 如果当前热更新的模块是一个advice,则删除advice
   */
  const controllerClass = old.exports.default || old.exports;
  if (typeof controllerClass !== 'function') {
    return;
  }
  // 移除控制器注册信息
  const descriptors = runtime.allControllerDescriptors;
  const findItem = descriptors.find((s) => s.ctor === controllerClass);
  const index = descriptors.indexOf(findItem);
  const scope = runtime.scopeControllers;
  if (index > -1) {
    // 移除控制器注册信息
    descriptors.splice(index, 1);
  }
  // 移除scope实例
  Object.keys(scope).forEach((k) => {
    const controllers = scope[k];
    if (controllers) {
      // 移除旧的实例
      scope[k] = controllers.filter((c) => !(c instanceof controllerClass))
    }
  });
  // 如果当前热更新的是一个advice 
  if (runtime.controllerAdviceInstance instanceof controllerClass) {
    runtime.controllerAdviceInstance = null;
  }
})