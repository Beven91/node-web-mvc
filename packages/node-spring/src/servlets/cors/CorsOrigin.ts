import AliasFor from '../annotations/AliasFor';
import Target from '../annotations/Target';
import ElementType from '../annotations/annotation/ElementType';
import { HttpMethodKeys } from '../http/HttpMethod';

class CorsOrigin {
  @AliasFor('origins')
  value?: string[] = [];

  @AliasFor('value')
  origins?: string[] = [];

  originPatterns?: RegExp[];

  // 跨域允许传递的请求头
  allowedHeaders?: string[];

  // 跨域允许返回的返回头
  exposedHeaders?: string[];

  // 跨域允许的请求方式
  methods?: HttpMethodKeys[];

  // 跨域允许的认证模式
  allowCredentials?: boolean;

  allowPrivateNetwork?: boolean;

  maxAge?: number = -1;
}

export default Target([ ElementType.TYPE, ElementType.METHOD ])(CorsOrigin);
