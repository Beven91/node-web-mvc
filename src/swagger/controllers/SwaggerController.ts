import fs from 'fs';
import path from 'path';
import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import OpenApi from '../openapi/index';
import ServletRequest from '../../servlets/annotations/params/ServletRequest';
import ServletResponse from '../../servlets/annotations/params/ServletResponse';

// 设置常见内容文件返回mime
const producers = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
}

export default class SwaggerController {

  /**
   * 用于构建当前环境的所有接口的openapi.json文档结构文件
   */
  @RequestMapping({  value: '/swagger/openapi.json', produces: 'application/json' })
  openapi() {
    return OpenApi.build();
  }

  /**
   * 用于返回swagger-ui下的静态资源
   */
  @RequestMapping('/swagger/(.*)')
  static(@ServletRequest request,@ServletResponse response) {
    const name = request.path.split('/swagger/').slice(1).join('');
    const view = name || 'index.html';
    const file = path.join(__dirname,'../../../swagger-ui', view);
    const ext = path.extname(file);
    if (!fs.existsSync(file)) {
      // 如果文件按不存在，则移交给其他执行器
      return;
    }
    if (producers[ext]) {
      // 设置返回内容类型
      response.setHeader('Content-Type', producers[ext]);
    }
    // 返回文件内容
    return fs.readFileSync(file);
  }
}
