/**
 * @module RequestMappingHandlerMapping
 * @description controller请求方法映射处理器
 */

import AbstractHandlerMapping from "./AbstractHandlerMapping";
import ServletContext from "../http/ServletContext";
import InterruptModel from "../models/InterruptModel";
import HandlerMethod from "../method/HandlerMethod";

const runtime = {
  instance: null as NoRequestHandlerMapping
}

export default class NoRequestHandlerMapping extends AbstractHandlerMapping {

  static getInstance() {
    if (!runtime.instance) {
      return runtime.instance = new NoRequestHandlerMapping();
    }
    return runtime.instance;
  }

  /**
   * 根据当前请求对象获取 处理器执行链
   * @param context 请求上下文对象
   */
  getHandlerInternal(context: ServletContext) {
    return new HandlerMethod({}, () => new InterruptModel())
  }
}
