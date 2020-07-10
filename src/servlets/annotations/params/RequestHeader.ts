
/**
 * @module RequestHeader
 * @description 提取header中的信息作为参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 提取header中的信息作为参数值
 *  
 *  action(@RequestHeader({ value:'accept' }) id)
 * 
 */
export default function RequestHeader(target: MethodParameterOptions | Object, name?: string, index?: number): any {
  if (arguments.length === 3) {
    // 长度为3表示使用为参数注解
    return createParam(target, name, { value: null }, index, 'header', RequestHeader);
  } else {
    // 通过调用返回注解
    const isString = typeof target === 'string';
    const options = (isString ? { value: target } : target) as MethodParameterOptions;
    return function (newTarget, newName, newIndex) {
      newIndex = isNaN(newIndex) ? -1 : newIndex;
      return createParam(newTarget, newName, options, newIndex, 'query', RequestHeader);
    }
  }
}