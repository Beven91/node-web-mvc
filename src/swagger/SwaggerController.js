import { RequestMapping } from '../annotations';

export default class SwaggerController {
  @RequestMapping('/swagger/**')
  main(request, response) {
    switch (request.path) {
      case '/swagger':
      case '/swagger/':
        return this.index(request, response);
      default:
        return this.static(request, response);
    }
  }

  /**
   * 处理swagger首页
   * @param {*} request
   * @param {*} response
   */
  index(request, response) {

  }

  /**
   * 处理swager静态资源
   */
  static(request, response) {

  }
}
