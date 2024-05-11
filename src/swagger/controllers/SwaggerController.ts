import RestController from '../../servlets/annotations/RestController';
import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import ServletRequest from '../../servlets/annotations/params/ServletRequest';
import HttpServletRequest from '../../servlets/http/HttpServletRequest';
import ApiIgnore from '../annotations/ApiIgnore';
import OpenApi from '../openapi/index';

@ApiIgnore
@RestController
export default class SwaggerController {

  /**
   * 用于构建当前环境的所有接口的openapi.json文档结构文件
   */
  @RequestMapping({ value: '/swagger-ui/openapi.json', produces: 'application/json' })
  openapi(@ServletRequest request: HttpServletRequest) {
    return (new OpenApi()).build(request.contextPath);
  }
}