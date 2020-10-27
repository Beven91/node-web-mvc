/**
 * @module ServletNodeContext
 * @description node原生框架接入上下文实现
 */
import http from 'http';
import ServletContext from '../http/ServletContext';
import WebAppConfigurer from '../WebAppConfigurer';

export default class ServletNodeContext extends ServletContext {
  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback) {
    const configurer = WebAppConfigurer.configurer;
    const port = configurer.port;
    const server = http.createServer((req, res) => {
      Object.defineProperty(req, 'path', { value: req.url });
      callback(req, res, (err) => {
        if (err) {
          console.error(err.stack || err);
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
      if (configurer.onLaunch) {
        configurer.onLaunch();
      } else {
        console.log(`
        -------------------------------------
        ====> Start node-mvc
        ====> Enviroment: development
        ====> Listening: port ${port}
        ====> Url: http://localhost:${port}/swagger-ui/index.html
        -------------------------------------
      `);
      }
    });
    return () => {
    }
  }
}