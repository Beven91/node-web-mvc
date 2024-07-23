import { HandlerInterceptor, HttpServletRequest } from '../../../src/index';

export default class EncodeInterceptor extends HandlerInterceptor {

  preHandle(request: HttpServletRequest) {
    console.log('EncodeInterceptor.preHandle called.');
    return true;
  }

  postHandle() {
    console.log('EncodeInterceptor.postHandle called.');
  }

  afterCompletion() {
    console.log('EncodeInterceptor.afterCompletion called.');
  }
}