/**
 * @module BeanScopeProvider
 * @description 用于管理bean作用域
 */

import ServletContext from "../servlets/http/ServletContext";

class BeanScopeProvider {

  // 当前请求上下文
  private servletContext: ServletContext

  createInstance() {

  }

}

export default new BeanScopeProvider();