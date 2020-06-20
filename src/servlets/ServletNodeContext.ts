/**
 * @module ServletNodeContext
 * @description node原生框架接入上下文实现
 */
import ServletContext from './ServletContext';
import http from 'http';

export default class ServletNodeContext extends ServletContext {
  /**
   * 当前请求的path 例如: order/list
   */
  get path() {
    return this.request.url.split('?').shift();
  }

  /**
  * 当前请求的谓词，例如: GET POST PUT DELETE等
  */
  get method() {
    return this.request.method;
  }

  /**
   * 返回内容到客户端
   * @param {any} data 要返回的数据
   * @param {number} status 当前设置的返回状态码
   * @param {String} procudes 当前返回的内容类型
   */
  end(data, status, procudes) {
    this.response.writeHead(status).end(data);
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback, options) {
    const port = options.port;
    const server = http.createServer((req, res) => {
      Object.defineProperty(req, 'path', { value: req.url });
      callback(req, res, (err) => {
        if (err) {
          console.error(err);
          res.writeHead(500).end('internal error');
        } else {
          res.writeHead(404).end();
        }
      });
    });
    server.on('clientError', (err, socket) => {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    });
    server.listen(port, () => {
      console.log(`
        -------------------------------------
        ====> Start node-mvc
        ====> Enviroment: development
        ====> Listening: port ${port}
        ====> Url: http://localhost:${port}/swagger/index.html
        -------------------------------------
      `);
    });
    return () => {
    }
  }
}