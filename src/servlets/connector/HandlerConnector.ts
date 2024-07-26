import { IncomingMessage, ServerResponse } from 'http';
import type WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';

export type ServletHandler = (request: IncomingMessage, response: ServerResponse, next: (error?: any) => any) => any;

export type ConnectHandler = (handler: ServletHandler, config: WebMvcConfigurationSupport) => void;

export default interface HandlerConnector {
  /**
   * 链接指定类型框架到 servlet请求上下文
   * @param options
   */
  connect(handler: ServletHandler, config: WebMvcConfigurationSupport): Promise<void>
}
