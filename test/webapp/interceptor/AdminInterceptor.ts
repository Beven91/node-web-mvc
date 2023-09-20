import { HandlerInterceptorAdapter, HandlerMethod } from '../../../src/index';
import Security from '../annotations/SecurityAnnotation';


export default class AdminInterceptor extends HandlerInterceptorAdapter {

  preHandle(request,response,handler:HandlerMethod) {
    const a = handler.getClassAnnotation(Security);
    const m = handler.getAnnotation(Security);
    console.log('a',a)
    console.log('m',m)
    console.log('AdminInterceptor.preHandle called');
    if (request.path === '/scope/admin') {
      return false;
    }
    return true;
  }

  postHandle() {
    console.log('AdminInterceptor.postHandle called');
  }

  afterCompletion() {
    console.log('AdminInterceptor.afterCompletion called');
  }
}