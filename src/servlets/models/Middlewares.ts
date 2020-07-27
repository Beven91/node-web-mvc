/**
 * @module Middlewares
 * @description 返回一个类似express中间件类型的中间件结果
 */

import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import { InterruptModel } from "../..";

export default class Middlewares {

  private middlewares: Array<Function>

  public execute(req: HttpServletRequest, resp: HttpServletResponse) {
    return new Promise((resolve, reject) => {
      const request = req.nativeRequest;
      const response = resp.nativeResponse;
      const middlewares = [
        ...this.middlewares,
        () => resolve(new InterruptModel())
      ];
      const handler = middlewares.reverse().reduce((next, middleware) => {
        return () => {
          try {
            middleware(request, response, (ex) => (ex ? reject(ex) : next()));
          } catch (ex) {
            reject(ex);
          }
        }
      });
      handler();
    });
  }

  constructor(middlewares) {
    this.middlewares = middlewares;
  }
}