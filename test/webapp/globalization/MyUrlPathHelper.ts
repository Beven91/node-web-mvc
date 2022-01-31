import { HttpServletRequest } from "../../../src";
import UrlPathHelper from "../../../src/servlets/util/UrlPathHelper";

export default class MyUrlPathHelper extends UrlPathHelper {

  getServletPath(request: HttpServletRequest) {
    return request.usePath; // + '/';
  }
}