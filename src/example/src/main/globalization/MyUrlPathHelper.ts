import { HttpServletRequest, UrlPathHelper } from 'node-web-mvc';

export default class MyUrlPathHelper extends UrlPathHelper {
  getServletPath(request: HttpServletRequest) {
    return request.path; // + '/';
  }
}
