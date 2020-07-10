
/**
 * @module PathVariable
 * @description 提取path中请求参数值
 */
import createParam from './createParam';
import { MethodParameterOptions } from '../../../interface/MethodParameter';

/**
 * 从请求path中提取指定名称的参数值
 * 
 *  action(@PathVariable id)
 * 
 *  action(@PathVariable({ required: true }) id) 
 */
export default function PathVariable(target: MethodParameterOptions | Object | string, name?: string, index?: number): any {
  if (arguments.length === 3) {
    // 长度为3表示使用为参数注解
    return createParam(target, name, { value: null }, index, 'path', PathVariable);
  } else {
    // 通过调用配置返回注解
    const isString = typeof target === 'string';
    const options = (isString ? { value: target } : target) as MethodParameterOptions;
    return function (newTarget, newName, newIndex) {
      newIndex = isNaN(newIndex) ? -1 : newIndex;
      return createParam(newTarget, newName, options, newIndex, 'path', PathVariable);
    }
  }
}