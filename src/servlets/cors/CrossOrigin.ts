/**
 * @module CrossOrigin
 * @description  用于标注单个接口跨域
 */
import Target from '../annotations/Target';
import ElementType from '../annotations/annotation/ElementType';
import RuntimeAnnotation from '../annotations/annotation/RuntimeAnnotation';

class CrossOrigin {

  constructor(meta: RuntimeAnnotation) {
  }
}

/**
 * 从请求path中提取指定名称的参数值
 * 
 *  action(@PathVariable id)
 * 
 *  action(@PathVariable({ required: true }) id) 
 */
export default Target([ElementType.TYPE, ElementType.METHOD])(CrossOrigin);