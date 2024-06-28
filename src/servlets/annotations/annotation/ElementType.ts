/**
 * @module ElementType
 * @description 注解类范围枚举
 */

import AnnotationElementTypeError from "../../../errors/AnnotationElementTypeError";
import Javascript from "../../../interface/Javascript";

enum ElementType {
  /**
   * 标识注解可以使用在 类上
   */
  TYPE = 'TYPE',

  /**
   * 标识注解可以使用在 类函数上
   */
  METHOD = 'METHOD',

  /**
   * 标识注解可以使用在函数参数 
   */
  PARAMETER = 'PARAMETER',

  /**
   * 标识注解可以使用在 class的属性上
   */
  PROPERTY = 'PROPERTY'
}


function isPropertyDescritpor(descriptor) {
  if (descriptor && typeof descriptor === 'object') {
    return 'get' in descriptor && 'set' in descriptor;
  }
}


export function reflectAnnotationType(options: Array<any>): ElementType | 'UNKNOW' {
  if (!options || options.length < 0 || options.length > 3 || !options[0]) {
    return 'UNKNOW';
  }
  const length = options.length;
  const [target, name, descriptor] = options;
  const clazz = length == 1 ? target : target?.constructor;
  const isClass = Javascript.isClass(clazz);
  if (!isClass) {
    // 如果不是作用在class上则直接判定为未知
    return 'UNKNOW';
  }
  if (length === 1) {
    return ElementType.TYPE;
  } else if (length === 3 && (descriptor === undefined || isPropertyDescritpor(descriptor))) {
    return ElementType.PROPERTY
  } else if (length === 3) {
    const isNumber = typeof descriptor === 'number';
    return isNumber ? ElementType.PARAMETER : ElementType.METHOD;
  }
  return 'UNKNOW';
}

export function checkAnnotation(types: ElementType[], options, name) {
  const elementType = reflectAnnotationType(options) as ElementType;
  if (types.length > 0 && types.indexOf(elementType) < 0) {
    throw new AnnotationElementTypeError(name, types);
  }
  return elementType;
}

export default ElementType;