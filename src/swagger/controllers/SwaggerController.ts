import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import RequestContext from '../../servlets/annotations/params/RequestContext';
import ServletContext from '../../servlets/http/ServletContext';
import OpenApi from '../openapi/index';

export default class SwaggerController {

  /**
   * 用于构建当前环境的所有接口的openapi.json文档结构文件
   */
  @RequestMapping({ value: '/swagger-ui/openapi.json', produces: 'application/json' })
  openapi(@RequestContext context: ServletContext) {
    return OpenApi.build(context.configurer.contextPath);
  }
}