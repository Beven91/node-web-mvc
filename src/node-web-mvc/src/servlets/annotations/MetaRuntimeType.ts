

import Target from './Target';
import ElementType from './annotation/ElementType';

export interface MetaRuntimeTypeInfo {
  // 运行时类型 为null则表示无运行时类型
  type: Function
  // 类型名称
  name: string
  // 是否为数组类型
  array: boolean
  fullName: string
  // 当前是否为泛型参数
  tp?: boolean
  // 如果当前类型是泛型类型，则会存在
  args: MetaRuntimeTypeInfo[]
}

class MetaRuntimeType {
  /**
   * 完整类型名
   */
  value?: string;

  /**
   * 完整类型名的具体信息
   */
  type: MetaRuntimeTypeInfo;

  constructor() {
    const a = 10;
  }
}

export default Target([ ElementType.PARAMETER, ElementType.METHOD, ElementType.PROPERTY ])(MetaRuntimeType);
