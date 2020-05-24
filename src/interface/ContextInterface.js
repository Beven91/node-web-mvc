
class ContextInterface {
  constructor(request, response, next) {
    this.request = request;
    this.response = response;
    this.next = next;
    // 当前匹配到的控制器类
    this.controllerClass = null;
    // 当前匹配到的动作名称
    this.actionName = '';
    // 当前请求提取出来的参数
    this.requestParams = '';
  }

  // 当前匹配到的控制器的名字
  get controllerName() {
    return this.controllerClass ? this.controllerClass.name : '';
  }

  // 获取当前请求的路径
  get path() {
    throw new Error('Please implements path property');
  }

  // 获取当前请求方法
  get method() {
    throw new Error('Please implements path property');
  }
}

module.exports = ContextInterface;