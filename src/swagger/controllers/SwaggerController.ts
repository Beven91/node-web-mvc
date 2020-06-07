import fs from 'fs';
import path from 'path';
import { RequestMapping } from '../../annotations';

export default class SwaggerController {
  @RequestMapping('/swagger/(.*)')
  main(request, response, next) {
    const name = request.path.split('/swagger/').slice(1).join('');
    const view = name || 'index.html';
    const file = path.join(__dirname, '../swagger-ui', view);
    const ext = path.extname(file);
    if (!fs.existsSync(file)) {
      // 如果文件按不存在，则移交给其他执行器
      return next();
    }
    // 设置返回内容类型
    this.producers(response, ext);
    // 返回文件内容
    return fs.readFileSync(file);
  }

  producers(response, ext) {
    switch (ext) {
      case '.js':
        response.setHeader('Content-Type', 'text/javascript');
        break;
      case '.html':
        response.setHeader('Content-Type', 'text/html');
        break;
      case '.css':
        response.setHeader('Content-Type', 'text/css');
        break;
    }
  }
}
