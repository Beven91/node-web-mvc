/**
 * @module ServletNodeContext
 * @description node原生框架接入上下文实现
 */
import http from 'http';
import https from 'https';
import http2 from 'http2';
import type WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HandlerConnector, { ServletHandler } from './HandlerConnector';

export default class NodeNativeConnector implements HandlerConnector {
  private createServer(configurer: WebMvcConfigurationSupport, handler: any) {
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

  connect(handler: ServletHandler, config: WebMvcConfigurationSupport) {
    return new Promise<void>((resolve, reject) => {
      const port = config.port;
      const server = this.createServer(config, (req, res) => {
        Object.defineProperty(req, 'path', { value: req.url });
        handler(req, res, (err) => {
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
        resolve();
      });
      server.on('error', reject);
    });
  }
}
