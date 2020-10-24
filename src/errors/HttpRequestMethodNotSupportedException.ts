/**
 * @module HttpRequestMethodNotSupportedException
 * @description 请求方法不支持
 */

export default class HttpRequestMethodNotSupportedException extends Error {
  constructor(method: string, allowMethods: Array<string>) {
    super(`${allowMethods.join(',')} Request method ${method} not supported`)
  }
}