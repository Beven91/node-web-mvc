/**
 * 简单MVC 控制器工厂,用于构造controller
 * 不另设api，零学习成本，每个controller.action都是一个express的中间件，
 */

import fs from 'fs';
import path from 'path';
import Routes from './routes/RouteCollection';
import Controller from './Controller'
import ServletContext from './servlets/http/ServletContext';
import ControllerManagement from './ControllerManagement';
import ServletModel from './servlets/models/ServletModel';
import InterruptModel from './servlets/models/InterruptModel';
import DispatchServlet from './servlets/DispatcherServlet';

const logger = console;

//默认mvc域名
const defaultArea = "";
//全局注册controller
const registedAreaControllers: Map<String, Controller> = ({}) as Map<String, Controller>;
//全局控制器工厂实例
let defaultFactoryController: ControllerFactory = null;

export default class ControllerFactory {

  // 设置默认的控制器
  static get defaultFactory(): ControllerFactory {
    if (!defaultFactoryController) {
      defaultFactoryController = new ControllerFactory();
    }
    return defaultFactoryController;
  }

  // 设置默认控制器
  static set defaultFactory(value: ControllerFactory) {
    defaultFactoryController = value;
  }

  /**
   * 判断传入类是否为一个Controller
   */
  static isController(controllerClass): boolean {
    return controllerClass && controllerClass.prototype && controllerClass.prototype.isController === true;
  }

  /**
   * 获取指定域注册的所有controller
   * @static
   * @param {String} area 域名称
   * @param {Boolean} ensure 当ensure为true时：当获取不到对应的域会自动创建域
   */
  static getAreaControllers(area: string, ensure?: boolean): Map<String, Controller> {
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
  static registerController(controllerClass: typeof Controller, areaName: string) {
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
      // logger.warn('Find a Controller but it`not extends Controller or module.exports is not set')
      // if (controllerClass) {
      //   logger.warn(`Controller file: ${controllerClass.__file}`)
      // }
    }
  }

  /**
   * 根据指定目录统一注册Controller
   * @static
   * @param {String} dir 目录地址
   */
  static registerControllers(dir: string) {
    const files = fs.readdirSync(dir).filter((name) => {
      const ext = path.extname(name);
      return ext === '.js' || ext === '.ts';
    });
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
  static registerAreaControllers(areaName: string, dir: string) {
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
   * 根据传入context执行控制器
   * @param {ControllerContext} servletContext 控制器执行上下文
   */
  executeController(servletContext: ServletContext): Promise<ServletModel> {
    return new Promise((resolve, reject) => {
      // 创建控制器
      this.createController(servletContext);
      if (!servletContext.controller) {
        resolve(new InterruptModel());
      } else if (typeof servletContext.action !== 'function') {
        logger.debug(`Cannot find Controller from: ${servletContext.controllerName}/${servletContext.actionName}`)
        resolve(new InterruptModel());
      } else {
        return (new DispatchServlet()).doService(servletContext).then(resolve, reject)
      }
    })
  }

  /**
   * 根据controllerContext 来匹配且创建控制器信息
   */
  createController(servletContext: ServletContext) {
    const pathContext = Routes.match(servletContext.request);
    const areaRegisterControllers = ControllerFactory.getAreaControllers(pathContext.area) || {};
    const controllerName = (pathContext.controllerName || '').toLowerCase();
    // 设置匹配到的控制器
    servletContext.Controller = pathContext.controller || areaRegisterControllers[controllerName];
    // 设置控制器名称
    servletContext.controllerName = pathContext.controllerName;
    // 创建控制器
    servletContext.controller = ControllerManagement.createController(servletContext);
    // 设置匹配到的action
    servletContext.action = ControllerManagement.creatAction(servletContext.controllerName, pathContext.action || pathContext.actionName);
    // 设置actionName
    servletContext.actionName = pathContext.actionName;
    // 设置从路径中解析出来的参数
    servletContext.params = pathContext.params || {};
    // 设置params参数
    servletContext.request.pathVariables = servletContext.params;
    return servletContext;
  }

  /**
   * 根据请求动态构建controller，
   * 以及执行对应的controller.action 
   * @param {ControllerContext} servletContext 控制器执行上下文
   */
  handle(servletContext: ServletContext) {
    const runtime = { error: null };
    return this
      // 执行控制器
      .executeController(servletContext)
      .then((model: ServletModel) => {
        if (model instanceof InterruptModel && !servletContext.response.headersSent) {
          // 如果没有执行action,跳转到下一个
          servletContext.next()
        }
      })
      .catch((ex) => {
        runtime.error = ex;
        console.error(ex);
        if (!servletContext.response.headersSent) {
          // 如果出现意外异常
          servletContext.next(ex);
        }
      })
  }
}