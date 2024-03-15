/**
 * @module ServletNodeContext
 * @description node原生框架接入上下文实现
 */
import http from 'http';
import https from 'https';
import http2 from 'http2';
import ServletContext, { ServerLaunchOptions } from '../http/ServletContext';
import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';

export default class ServletNodeContext extends ServletContext {

  private static createHttp(configurer: WebMvcConfigurationSupport, handler: any) {
    const options = configurer.serverOptions || {};
    switch (configurer.http) {
      case 'https':
        return https.createServer(options as https.ServerOptions, handler);
      case 'http2':
        return http2.createServer(options as http2.ServerOptions, handler);
      default:
        return http.createServer(options as http.ServerOptions, handler);
    }
  }

  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param options 
   */
  static launch(options: ServerLaunchOptions) {
    const callback = options.handler;
    const port = options.config.port;
    const server = this.createHttp(options.config, (req, res) => {
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
      if (options.config?.onLaunch) {
        // configurer.onLaunch();
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