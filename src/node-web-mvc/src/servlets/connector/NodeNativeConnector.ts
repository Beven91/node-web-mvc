/**
 * @module ServletNodeContext
 * @description node原生框架接入上下文实现
 */
import http from 'http';
import https from 'https';
import http2 from 'http2';
import HandlerConnector, { ServletHandler } from './HandlerConnector';
import { NodeServerOptions } from '../SpringBootApplication';

export default class NodeNativeConnector implements HandlerConnector {
  private createServer(config: NodeServerOptions, handler: any) {
    switch (config.httpType) {
      case 'https':
        return https.createServer(config as https.ServerOptions, handler);
      case 'http2':
        return http2.createServer(config as http2.ServerOptions, handler);
      default:
        return http.createServer(config as http.ServerOptions, handler);
    }
  }

  connect(handler: ServletHandler, config: NodeServerOptions) {
    return new Promise<http.Server>((resolve, reject) => {
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
      server.listen(config.port, () => {
        resolve(server as http.Server);
      });
      server.on('error', reject);
    });
  }
}
