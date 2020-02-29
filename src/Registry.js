const ControllerFactory = require('./ControllerFactory');

class Registry {
  /**
   * 启动mvc
   * @param {Express} app express实例 
   */
  static launch() {
    factory = ControllerFactory.defaultFactory;
    return (req, resp, next) => factory.handle(req, resp, next);
  }

  /**
   * 启动mvc
   * @param {*} factory 
   */
  static launchKoa() {
    factory = ControllerFactory.defaultFactory;
    return (ctx, next) => factory.handle(null, null, next, ctx);
  }
}

module.exports = Registry;