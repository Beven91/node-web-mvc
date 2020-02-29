/**
 * 简单MVC 控制器工厂,用于构造controller
 * 不另设api，零学习成本，每个controller.action都是一个express的中间件，
 */

const fs = require('fs');
const path = require('path');
const logger = console;
const Controller = require('./controller');
const Routes = require('./RouteCollection');

//默认mvc域名
const defaultArea = "";
//全局注册controller
const registedAreaControllers = {};
//全局控制器工厂实例
let defaultFactoryController = null;

class ControllerFactory {

  constructor() {
    // 已经初始化完成的controller实例
    this.controllers = [];
  }

  // 设置默认的控制器
  static get defaultFactory() {
    return defaultFactoryController;
  }

  // 设置默认控制器
  static set defaultFactory(value){
    defaultFactoryController = value;
  }

  /**
   * 判断传入类是否为一个Controller
   */
  static isController(controllerClass) {
    return controllerClass && controllerClass.prototype instanceof Controller;
  }

  /**
   * 获取指定域注册的所有controller
   * @static
   * @param {String} area 域名称
   * @param {Boolean} ensure 当ensure为true时：当获取不到对应的域会自动创建域
   */
  static getAreaControllers(area, ensure) {
    let areaRegisterControllers = registedAreaControllers[area];
    if (ensure && !areaRegisterControllers) {
      areaRegisterControllers = registedAreaControllers[area] = {};
    }
    return areaRegisterControllers;
  }

  /**
   * 注册一个Controller
   * @static
   * @param {Controller} 继承于Controller的类
   * @param {String} areaName MVC域名
   */
  static registerController(controllerClass, areaName) {
    if (areaName === null || areaName === undefined) {
      throw new Error("areaName Cannot be null or undefined");
    }
    if (this.isController(controllerClass)) {
      const areaRegisterControllers = this.getAreaControllers(areaName, true);
      //如果指定了静态变量controllerName
      let controllerName = controllerClass.controllerName;
      //如果没有强制指定controllerName 则默认根据类名推测名称（去除Controller字符)
      controllerName = controllerName || (controllerClass.name || '').replace('Controller', '');
      controllerName = controllerName.toLowerCase();
      logger.info(`Register Controller: ${controllerName}(Area:${areaName || 'default'})`)
      areaRegisterControllers[controllerName] = controllerClass;
    } else {
      logger.warn('Find a Controller but it`not extends Controller or module.exports is not set')
      if (controllerClass) {
        logger.warn(`Controller file: ${controllerClass.__file}`)
      }
    }
  }

  /**
   * 根据指定目录统一注册Controller
   * @static
   * @param {String} dir 目录地址
   */
  static registerControllers(dir) {
    const files = fs.readdirSync(dir).filter((name) => path.extname(name) === '.js');
    files.forEach((name) => {
      const file = path.join(dir, name);
      const controllerClass = require(file) || {};
      controllerClass.__file = file;
      this.registerController(controllerClass, defaultArea);
    })
  }

  /**
   * 根据指定目录统一注册Controller到指定域中去
   * @param {String} areaName 域名称
   * @param {String} dir 目录地址
   */
  static registerAreaControllers(areaName, dir) {
    if (areaName === null || areaName === undefined) {
      throw new Error("areaName Cannot be null or undefined");
    }
    const files = fs.readdirSync(dir).filter((name) => path.extname(name) === '.js');
    files.forEach((name) => {
      const file = path.join(dir, name);
      const controllerClass = require(file) || {};
      controllerClass.__file = file;
      this.registerController(controllerClass, areaName);
    })
  }

  /**
   * 手动传入controllerContext调用对应的controller
   * @static
   */
  static executeController(req, resp, next, controllerContext) {
    if (defaultFactoryController) {
      const name = (controllerContext.controllerName || '').toLowerCase()
      const areaRegisterControllers = registedAreaControllers[controllerContext.area || ""];
      controllerContext.findController = areaRegisterControllers[name]
      return defaultFactoryController.executeController(req, resp, next, controllerContext);
    } else {
      next();
    }
  }

  /**
   * 根据当前路由配置，查找对应的controller
   * @param {String} pathname 当前url.path
   */
  getController(req) {
    const findContext = {};
    const pathContext = Routes.match(req.path);
    const areaContext = {
      areaName: pathContext.area,
      controllerName: pathContext.controller,
      actionName: pathContext.action
    }
    const areaRegisterControllers = ControllerFactory.getAreaControllers(areaContext.areaName) || {};
    findContext.Controller = areaRegisterControllers[(areaContext.controllerName || '').toLowerCase()];
    findContext.actionName = areaContext.actionName;
    return findContext || {};
  }

  /**
   * 根据传入context执行控制器
   */
  executeController(controllerContext) {
    const { Controller, controllerName, actionName } = controllerContext;
    if (!Controller) {
      return next();
    } else if (!ControllerFactory.isController(Controller)) {
      logger.debug(`Cannot find Controller from: ${controllerName}/${actionName}`)
      logger.warn(`Invalid Controller:${controllerName},Please check it extends Controller`)
      return next();
    }
    const controller = this.createController(controllerContext);
    const action = actionName.toLowerCase()
    const keys = Reflect.ownKeys(findController.prototype);
    const actionHandleName = keys.find((m) => (m.toLowerCase()) == action);
    const actionHandle = controller[actionHandleName];
    if (typeof actionHandle !== 'function') {
      logger.debug(`Cannot find Controller from: ${controllerName}/${actionName}`)
      next();
    } else {
      return actionHandle.apply(controller, arguments);
    }
  }

  createController(controllerContext) {
    const { Controller } = controllerContext;
    // 查找改controller是否已初始化
    let controller = this.controllers.filter((controller) => {
      return controller instanceof Controller;
    }).pop();
    if (!controller) {
      controller = new Controller();
    }
    //定义只读参数context
    Object.defineProperty(controller, '_Context', {
      value: context,
      writable: false,
      enumerable: true,
      configurable: true
    })
    return controller;
  }

  /**
   * 根据请求动态构建controller，
   * 以及执行对应的controller.action 
   * @param {IcomminigMessage} req 请求对象(request)
   * @param {ServerResponse} resp 服务器响应对象(response)   
   * @param {Function} next 转交给下个express中间件
   */
  handle(req, resp, next, context) {
    const controllerContext = this.getController(req);
    const context2 = context || {};
    context2.request = context2.request || req;
    context2.response = context2.response || resp;
    context2.next = context2.next || next;
    controllerContext.handleContext = context2;
    return this.executeController(controllerContext)
  }
}

// 创建默认工厂
defaultFactoryController = new ControllerFactory();

module.exports = ControllerFactory;