
/**
 * @module ServletRsponse
 * @description 从请求上下文中提取 response对象
 */
import createParam from './createParam';
import Target from '../Target';
import RuntimeAnnotation from '../annotation/RuntimeAnnotation';
import MethodParameter from '../../../interface/MethodParameter';
import ElementType from '../annotation/ElementType';

class ServletRsponse {

  public param: MethodParameter

  constructor(meta: RuntimeAnnotation) {
    this.param = createParam({ required: true }, meta, 'response');
  }
}

/**
 * 从servlet上下文中提取response
 *
 * action(@ServletRequest response)
 * 
 */
export default Target(ElementType.PARAMETER)(ServletRsponse);