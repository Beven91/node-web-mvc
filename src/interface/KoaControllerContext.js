/**
 * @module KoaControllerContext
 * @description koa框架接入上下文实现
 */
const ContextInterface = require('./ContextInterface');

class KoaControllerContext extends ContextInterface {
  get path() {
    return this.request.path;
  }

  get method() {
    return this.request.method;
  }

  returnResponse(data, procudes) {
    const response = this.response;
    if (procudes) {
      response.set('Content-Type', procudes);
    }
    response.status = 200;
    response.body = data;
  }

  static launch(callback) {
    return function (context, next) {
      callback(context.request, context.response, next);
    }
  }
}

module.exports = KoaControllerContext;