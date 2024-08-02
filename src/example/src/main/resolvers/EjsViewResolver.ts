/**
 * @module EjsViewResolver
 * @description razor视图解析
 */
import fs from 'fs';
import path from 'path';
import { UrlBasedViewResolver, View, HttpServletRequest } from 'node-web-mvc';
import EjsView from './EjsView';

export default class EjsViewResolver extends UrlBasedViewResolver {
  internalResolve(viewName: string, model: any, request: HttpServletRequest): View {
    const file = path.resolve(viewName);
    if (fs.existsSync(file)) {
      return new EjsView(viewName);
    }
    return null;
  }
}
