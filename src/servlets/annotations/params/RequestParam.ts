
/**
 * @module RequestParam
 * @description 提取query请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 从query请求参数中，提取指定名称的参数值
 * 
 *  action(@RequestParam id)
 * 
 *  action(@RequestParam({ required: true }) id)
 * 
 */
export default function RequestParam(target: MethodParameterOptions | Object | string, name?: string, index?: number): any {
  if (arguments.length === 3) {
    // 长度为3表示使用为参数注解 例如:  index(@RequestParam id)
    return createParam(target, name, { value: null }, index, 'query', RequestParam);
  } else {
    // 通过调用配置返回注解
    const isString = typeof target === 'string';
    const options = (isString ? { value: target } : target) as MethodParameterOptions;
    return function (newTarget, newName, newIndex) {
      newIndex = isNaN(newIndex) ? -1 : newIndex;
      return createParam(newTarget, newName, options, newIndex, 'query', RequestParam);
    }
  }
}