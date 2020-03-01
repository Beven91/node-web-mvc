/**
 * MVC基础Controller类,
 * 用于派生相关Controller
 * 以及提供相关基础操作函数
 */

class Controller {

  get isController(){
    return true;
  }

  /**
   * 获取当前ImcommingMessage (Request)对象
   */
  get request() {
    return this.context.request;
  }

  /**
   * 获取当前ServerResponse 对象
   */
  get response() {
    return this.context.response;
  }

  /**
   * 获取请求上下文信息
   */
  get context() {
    return this._Context || {};
  }

  /**
   * 渲染视图
   * @param {String} view 视图路径 
   * @param {Object} data 视图数据
   * @param {String} layout 要使用的母版页
   */
  render(view, data, layout) {
    data = data || {};
    data.layout = arguments.length === 3 ? layout : data.layout;
    if (typeof this.context.render === 'function') {
      return this.context.render(view, data);
    } else {
      return this.response.render(view, data);
    }
  }

  /**
   * 返回一个分部视图
   * @param {String} view 视图路径 
   * @param {Object} data 视图数据
   */
  partial(view, data) {
    data = data || {};
    data.layout = null;
    this.render(view, data);
  }
}

module.exports = Controller;