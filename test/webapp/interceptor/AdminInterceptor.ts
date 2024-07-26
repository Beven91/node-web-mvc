import { HandlerInterceptor, HandlerMethod } from '../../../src/index';
import Security from '../annotations/Security';


export default class AdminInterceptor extends HandlerInterceptor {
  preHandle(request, response, handler: object) {
    if (!(handler instanceof HandlerMethod)) {
      return;
    }
    const a = handler.getClassAnnotation(Security);
    const m = handler.getAnnotation(Security);
    console.log('Class.Annotation.Security', a);
    console.log('Method.Annotation.Security', m);
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
