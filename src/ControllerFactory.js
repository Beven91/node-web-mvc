/**
 * 简单MVC 控制器工厂,用于构造controller
 * 不另设api，零学习成本，每个controller.action都是一个express的中间件，
 */

const fs = require('fs');
const path = require('path');
const logger = console;
const Controller = require('./controller');
const Routes = require('./RouteCollection');
const ControllerManagement = require('./ControllerManagement');
const ControllerActionProduces = require('./producers/ControllerActionProduces');

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
    if (!defaultFactoryController) {
      defaultFactoryController = new ControllerFactory();
    }
    return defaultFactoryController;
  }

  // 设置默认控制器
  static set defaultFactory(value) {
    defaultFactoryController = value;
  }

  /**
   * 判断传入类是否为一个Controller
   */
  static isController(controllerClass) {
    return controllerClass && controllerClass.prototype && controllerClass.prototype.isController === true;
  }

  /**
   * 获取指定域注册的所有controller
   * @static
   * @param {String} area 域名称
   * @param {Boolean} ensure 当ensure为true时：当获取不到对应的域会自动创建域
   */
  static getAreaControllers(area, ensure) {
    area = area || '';
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
   * 根据传入context执行控制器
   * @param {ControllerContext} controllerContext 控制器执行上下文
   */
  executeController(controllerContext) {
    const { controller, controllerName, actionName, action } = controllerContext;
    if (!controller) {
      return controllerContext.next();
    }
    if (typeof action !== 'function') {
      logger.debug(`Cannot find Controller from: ${controllerName}/${actionName}`)
      controllerContext.next();
    } else {
      const { request, response, params } = controllerContext;
      // 参数赋值到request上
      request.params = params;
      const producer = new ControllerActionProduces(controllerContext, actionName);
      const result = action.call(controller, request, response);
      return producer.produce(result);
    }
  }

  /**
   * 根据请求动态构建controller，
   * 以及执行对应的controller.action 
   * @param {ControllerContext} controllerContext 控制器执行上下文
   */
  handle(controllerContext) {
    const pathContext = Routes.match(controllerContext);
    const areaRegisterControllers = ControllerFactory.getAreaControllers(pathContext.area) || {};
    const controllerName = (pathContext.controller || '').toLowerCase();
    // 设置匹配到的控制器
    controllerContext.controllerClass = pathContext.controllerClass || areaRegisterControllers[controllerName];
    // 创建控制器
    controllerContext.controller = ControllerManagement.createController(controllerContext);
    // 设置actionName
    controllerContext.actionName = pathContext.action;
    // 设置匹配到的action
    controllerContext.action = ControllerManagement.creatAction(controllerContext.controller, pathContext.action)
    // 设置从路径中解析出来的参数
    controllerContext.params = pathContext.params || {};
    // 开始执行
    return this.executeController(controllerContext);
  }
}

module.exports = ControllerFactory;