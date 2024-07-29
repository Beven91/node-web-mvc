import { IncomingMessage, ServerResponse } from 'http';
import { NodeServerOptions } from '../SpringBootApplication';

export type ServletHandler = (request: IncomingMessage, response: ServerResponse, next: (error?: any) => any) => any;

export default interface HandlerConnector {
  /**
   * 链接指定类型框架到 servlet请求上下文
   * @param options
   */
  connect(handler: ServletHandler, config: NodeServerOptions): Promise<void>
}

export type ConnectHandler = HandlerConnector['connect'];
