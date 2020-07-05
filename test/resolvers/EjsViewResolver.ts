/**
 * @module EjsViewResolver
 * @description razor视图解析
 */
import fs from 'fs';
import path from 'path';
import EjsView from './EjsView';
import UrlBasedViewResolver from "../../src/servlets/view/resolvers/UrlBasedViewResolver";
import View from "../../src/servlets/view/View";
import HttpServletRequest from "../../src/servlets/http/HttpServletRequest";

export default class EjsViewResolver extends UrlBasedViewResolver {

  internalResolve(viewName: string, model: any, request: HttpServletRequest): View {
    const file = path.resolve(viewName);
    if (fs.existsSync(file)) {
      return new EjsView(viewName);
    }
    return null;
  }

}