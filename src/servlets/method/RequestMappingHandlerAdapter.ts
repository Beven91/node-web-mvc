/**
 * @module RequestMappingHandlerAdapter
 * @description 用于根据配置的路由mapping来处理action
 */
import AbstractHandlerMethodAdapter from './AbstractHandlerMethodAdapter';
import HandlerMethod from './HandlerMethod';
import ServletContext from '../ServletContext';

export default class RequestMappingHandlerAdapter extends AbstractHandlerMethodAdapter {
  supportsInternal() {
    return true;
  }

  handleInternal(servletContext: ServletContext, handler: HandlerMethod) {
    return handler.invoke();
  }
}