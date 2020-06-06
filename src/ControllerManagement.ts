/**
 * @module ControllerManagement
 * @description 控制器scope管理
 */
import Javascript from './interface/Javascript';
import ServletContext from './servlets/ServletContext';

const runtime = {
  // 控制器作用域控制存储器
  scopeControllers: {
    // 单例控制器实例
    singleton: [],
    // 多例控制器实例，多例控制器不做存储
    'prototype': null
  },
  // 控制器特征属性
  controllerAttributes: [],
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
  static getControllerAttributes(ctor) {
    const controllerAttributes = runtime.controllerAttributes;
    let attributes = controllerAttributes.find((attr) => attr.ctor === ctor);
    if (!attributes) {
      attributes = { ctor: ctor };
      controllerAttributes.push(attributes);
    }
    return attributes;
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
    const { controllerClass } = servletContext;
    if (!controllerClass) {
      return null;
    }
    const controllerAttributes = runtime.controllerAttributes;
    const Controller = controllerClass;
    const attributes = controllerAttributes.find((feature) => feature.ctor === Controller) || {};
    const scope = attributes.scope || 'singleton';
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
    const attributes = ControllerManagement.getControllerAttributes(Controller);
    if (!attributes.actions) {
      const actions = attributes.actions = {};
      const actionNames = Reflect.ownKeys(controller.__proto__).filter((key) => !Javascript.protoKeys[key]);
      actionNames.forEach((key) => {
        actions[key] = {
          value: Controller.prototype[key]
        }
      })
    }
    return attributes.actions;
  }
}