import { HandlerInterceptorAdapter  } from '../../../src/index';


export default class EncodeInterceptor extends HandlerInterceptorAdapter {

  preHandle() {
    console.log('EncodeInterceptor.preHandle called.');
    return true;
  }

  postHandle() {
    console.log('EncodeInterceptor.postHandle called.');
  }

  afterCompletion(){
    console.log('EncodeInterceptor.afterCompletion called.');
  }
}