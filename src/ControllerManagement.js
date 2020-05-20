/**
 * @module ControllerManagement
 * @description 控制器scope管理
 */
const scopeControllers = {
  // 单例控制器实例
  singleton: [],
  // 多例控制器实例，多例控制器不做存储
  'prototype': null
}

// 控制器特征属性
const controllerAttributes = [];

class ControllerManagement {

  /**
   * 设置控制器特征属性
   * @param {String} name 特征名
   * @param {any} value 特征值  
   * @param {ControllerClass} ctor 所属控制器 
   */
  static setControllerAttribute(name, value, ctor) {
    const attributes = controllerAttributes.find((attr) => attr.ctor === ctor);
    if (!attributes) {
      attributes = { ctor: ctor };
      controllerAttributes.push(attributes);
    }
    attributes[name] = value;
  }

  /**
   * 获取控制器的所有特征属性
   * @param {ControllerClass} ctor 
   */
  static getControllerAttributes(name,ctor){
    return controllerAttributes.find((attr) => attr.ctor === ctor);
  }

  /**
   * 存放scope控制器实例
   * @param {*} scope 作用域
   * @param {Controller} instance 控制器实例 
   */
  static addScopeController(scope, controller) {
    const container = scopeControllers[scope];
    if (container) {
      const addable = !container.find((instance) => instance === controller);
      addable ? container.push(controller) : undefined;
    }
  }

  /**
   * 创建一个控制器实例
   * @param {ControllerContext} controllerContext 创建上下文参数
   */
  static createController(controllerContext) {
    const { Controller } = controllerContext;
    const feature = featureAttributes.find((feature) => feature.Controller === Controller) || {};
    const container = scopeControllers[feature.scope] || [];
    let controller = container.find((instance) => instance.constructor === Controller);
    if (!controller) {
      controller = new Controller();
      this.addScopeController(feature.scope, controller);
    }
    //定义只读参数context
    Object.defineProperty(controller, '_Context', {
      value: controllerContext.handleContext,
      writable: false,
      enumerable: true,
      configurable: true
    })
    return controller;
  }
}

module.exports = ControllerManagement;