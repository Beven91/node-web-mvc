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
   * 获取控制器的所有特征属性
   * @param {ControllerClass} ctor 
   */
  static getControllerAttributes(ctor) {
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
    const { controllerClass } = controllerContext;
    if (!controllerClass) {
      return null;
    }
    const Controller = controllerClass;
    const feature = controllerAttributes.find((feature) => feature.ctor === Controller) || {};
    const container = scopeControllers[feature.scope] || [];
    let controller = container.find((instance) => instance.constructor === Controller);
    if (!controller) {
      controller = new Controller();
      this.addScopeController(feature.scope, controller);
    }
    return controller;
  }
}

module.exports = ControllerManagement;