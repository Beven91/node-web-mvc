/**
 * @module Middlewares
 * @description 返回一个类似express中间件类型的中间件结果
 */

import { Middleware } from "../../interface/declare";
import HttpServletRequest from "../http/HttpServletRequest";
import HttpServletResponse from "../http/HttpServletResponse";
import InterruptModel from './InterruptModel';

export default class Middlewares {

  private middlewares: Array<Middleware>

  public execute(req: HttpServletRequest, resp: HttpServletResponse) {
    return new Promise((resolve, reject) => {
      const request = req.nativeRequest;
      const response = resp.nativeResponse;
      const middlewares = [
        ...this.middlewares,
        () => resolve(new InterruptModel())
      ];
      const handler = middlewares.reverse().reduce((next: any, middleware) => {
        return () => {
          try {
            middleware(request, response, (ex) => (ex ? reject(ex) : next()));
          } catch (ex) {
            reject(ex);
          }
        }
      });
      handler(request, response, resolve);
    });
  }

  constructor(middlewares) {
    this.middlewares = middlewares;
  }
}