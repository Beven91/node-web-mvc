

import Target from './Target';
import ElementType from './annotation/ElementType';

const createType = (name: string, type: object, fullName?: string):MetaRuntimeTypeInfo => {
  return {
    fullName: fullName,
    type: typeof type == 'function' ? type : null,
    name: name,
    isArray: name.slice(-2) == '[]',
    parameters: null,
  };
};

export interface MetaRuntimeTypeInfo {
  type: Function
  name: string
  isArray: boolean
  fullName: string
  parameters: MetaRuntimeTypeInfo[]
}

type ParameterRuntimeType = object | object[] | { array: object };

class MetaRuntimeType {
  value?: string;

  __exclude_keys__ = 'getRuntimeTypeInfo';

  /**
   * 类型对应的实际对象
   * 例如:
   * Promise<A> 则: [Promise,A]
   * Promise<A[]> 则 [Promise, {array: A}]
   * Map<string,A> 则 [Map, [string, A]]
   * 如果A 在运行没有实际类型则
   * Promise<A> 则: [Promise,'A']
   * Promise<A[]> 则 [Promise, 'A[]']
   * Map<string,A> 则 [Map, [string, 'A']]
   */
  parameters?: ParameterRuntimeType[];

  getRuntimeTypeInfo(): MetaRuntimeTypeInfo {
    if (!this.value) return null;
    const segments = this.value.split('<').map((m) => m.trim().replace(/>/g, ''));
    const parameters = this.parameters || [];
    const name = segments.shift();
    const type = parameters.shift();
    const mainType = createType(name, type, this.value);
    mainType.parameters = segments.map((name, i) => {
      return createType(name, parameters[i]);
    });
    return mainType;
  }
}

export default Target([ ElementType.PARAMETER, ElementType.METHOD, ElementType.PROPERTY ])(MetaRuntimeType);
