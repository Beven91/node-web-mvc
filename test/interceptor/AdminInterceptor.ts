import { HandlerInterceptorAdapter } from '../../src/index';


export default class AdminInterceptor extends HandlerInterceptorAdapter {

  preHandle(request) {
    console.log('AdminInterceptor.preHandle called...........');
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