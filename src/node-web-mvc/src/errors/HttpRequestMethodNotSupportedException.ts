/**
 * @module HttpRequestMethodNotSupportedException
 * @description 请求方法不支持
 */
import Exception from './Exception';

export default class HttpRequestMethodNotSupportedException extends Exception {
  constructor(method: string, allowMethods: Array<string>) {
    super(`${allowMethods.join(',')} Request method ${method} not supported`);
  }
}
