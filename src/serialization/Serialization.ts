/**
 * @module Serialization
 * 序列化工具
 */

import { ClazzType } from "../interface/declare";
import TypeConverter, { TypedArray } from "./TypeConverter";

const converter = new TypeConverter();

export default class Serialization {

  /**
   * 针对传入的json字符串反序列化为指定类型对象
   */
  deserialize(str: string, dataType: Function | ClazzType) {
    const data = JSON.parse(str);
    return converter.convert(data, dataType);
  }

  /**
   * 针对传入的data进行序列化
   * @param data 需要序列化的数据
   * @returns 
   */
  serialize(data: any) {
    return JSON.stringify(data, this.enhancedStringify.bind(this), 2);
  }

  private mapTypeStringify(map: Map<string, any>) {
    const data = {} as Record<string, any>;
    map.forEach((element, k) => {
      data[k] = element;
    })
    return data;
  }

  private setTypeStringify(set: Set<any>) {
    const data = [] as any[];
    set.forEach((element) => {
      data.push(element);
    })
    return data;
  }

  private typedArrayStringify(array: any[]) {
    const data = [] as any[];
    array.forEach((element) => {
      data.push(element);
    })
    return data;
  }

  private enhancedStringify(key: string, value: any) {
    if (value instanceof Map) {
      return this.mapTypeStringify(value);
    } else if(value instanceof Set) {
      return this.setTypeStringify(value);
    } else if(value instanceof TypedArray) {
      return this.typedArrayStringify(value);
    }
    return value;
  }
}