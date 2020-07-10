
/**
 * @module ServletParam
 * @description 提取path中请求参数值
 */
import createParam from './createParam';

/**
 * 从servlet上下文中提取request 与response 等参数
 *
 *  action(@ServletParam('request') id)
 * 
 */
export default function ServletParam(type?: 'request' | 'response' | 'next', name?: string) {
  const options = { value: name, paramType: type || name, required: true };
  return (target, name, index?) => {
    const newIndex = isNaN(index) ? -1 : index;
    return createParam(target, name, options, newIndex, type, ServletParam);
  }
}

/**
 * 从servlet上下文中提取request
 *
 * action(@ServletRequest request)
 * 
 */
export function ServletRequest(target, name, index?) {
  ServletParam('request')(target, name, index);
}

/**
 * 从servlet上下文中提取response
 *
 * action(@ServletResponse response)
 * 
 */
export function ServletResponse(target, name, index) {
  ServletParam('response')(target, name, index);
}