const ExpressControllerContext = require('./interface/ExpressControllerContext');
const KoaControllerContext = require('./interface/KoaControllerContext');
const ControllerFactory = require('./ControllerFactory');

// 已经注册执行上下文
const registration = {}

class Registry {
  /**
   * 注册一个控制器上下文
   * @param {String} name 平台类型名
   * @param {Class} contextClass 控制器上下文类
   */
  static register(name, contextClass) {
    registration[name] = contextClass;
  }

  /**
   * 根据指定目录统一注册Controller
   * @static
   * @param {String} dir 目录地址
   */
  static registerControllers(dir) {
    return ControllerFactory.registerControllers(dir);
  }

  /**
   * 启动mvc
   * @param {Express} app express实例 
   */
  static launch(options) {
    if (!options) {
      throw new Error('请设置options属性,例如:' + JSON.stringify({ mode: 'express|koa' }));
    }
    const ControllerContext = registration[options.mode];
    if (!ControllerContext) {
      throw new Error(`
        当前${options.mode}模式不支持,
        您可以通过Registry.register来注册对应的执行上下文
        Registry.register('${options.mode}',ContextClass)
      `);
    }
    return ControllerContext.launch((request, response, next) => {
      const context = new ControllerContext(request, response, next);
      ControllerFactory.defaultFactory.handle(context);
    });
  }
}

// 注册express实现
Registry.register('express', ExpressControllerContext);
// 注册koa实现
Registry.register('koa', KoaControllerContext);

module.exports = Registry;