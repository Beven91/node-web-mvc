import { HandlerInterceptorAdapter, HandlerMethod } from '../../../src/index';
import UserIdAnnotation from '../annotations/UserIdAnnotation';


export default class AdminInterceptor extends HandlerInterceptorAdapter {

  preHandle(request,response,handler:HandlerMethod) {
    const a = handler.getClassAnnotation(UserIdAnnotation);
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