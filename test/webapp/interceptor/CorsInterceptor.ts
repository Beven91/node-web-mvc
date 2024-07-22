import { HandlerInterceptorAdapter, HttpServletRequest, HttpServletResponse } from "../../../src";


export default class CorsInterceptor extends HandlerInterceptorAdapter {

  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: object): Promise<boolean> | boolean {
    console.log('after.........');
      response.setHeader('Access-Control-Allow-Origin', '*');
      response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return true;
  }

}