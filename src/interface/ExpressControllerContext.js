/**
 * @module ExpressControllerContext
 * @description express框架接入上下文实现
 */
const ContextInterface = require('./ContextInterface');

class ExpressControllerContext extends ContextInterface {
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
    response.send(data).status(200).end();
  }

  static launch(callback) {
    return function (request, response, next) {
      callback(request, response, next);
    }
  }
}

module.exports = ExpressControllerContext;