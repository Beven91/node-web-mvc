/**
 * @module RequestBody
 * @description 提取body请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 将body提取成指定参数
 * 
 *  action(@RequestBody user)
 * 
 *  action(@RequestBody({ required:true }) user)
 */
export default function RequestBody(target: MethodParameterOptions | Object | string, name?: string, index?: number): any {
  if (arguments.length === 3) {
    // 长度为3表示使用为参数注解
    return createParam(target, name, { value: null }, index, 'body', RequestBody);
  } else {
    // 通过调用配置返回注解
    const isString = typeof target === 'string';
    const options = (isString ? { value: target } : target) as MethodParameterOptions;
    return function (newTarget, newName, newIndex) {
      newIndex = isNaN(newIndex) ? -1 : newIndex;
      return createParam(newTarget, newName, options, newIndex, 'body', RequestBody);
    }
  }
}