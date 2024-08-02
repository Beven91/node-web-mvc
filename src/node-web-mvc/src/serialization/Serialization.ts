/**
 * @module Serialization
 * 序列化工具
 */

import { ClazzType } from '../interface/declare';
import RuntimeAnnotation from '../servlets/annotations/annotation/RuntimeAnnotation';
import JsonFormat from './JsonFormat';
import JsonSerialize from './JsonSerialize';
import TypeConverter, { TypedArray } from './TypeConverter';
import DateConverter from './date/DateConverter';

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
    const scope = this;
    return JSON.stringify(data, function(key, value) {
      return scope.enhancedStringify(key, value, this);
    }, 2);
  }

  private mapTypeStringify(map: Map<string, any>) {
    const data = {} as Record<string, any>;
    map.forEach((element, k) => {
      data[k] = element;
    });
    return data;
  }

  private setTypeStringify(set: Set<any>) {
    const data = [] as any[];
    set.forEach((element) => {
      data.push(element);
    });
    return data;
  }

  private typedArrayStringify(array: any[]) {
    const data = [] as any[];
    array.forEach((element) => {
      data.push(element);
    });
    return data;
  }

  private dateStringify(date: Date, clazz: ClazzType, name: string, value: string) {
    const jsonFormat = RuntimeAnnotation.getPropertyAnnotation(clazz, name, JsonFormat);
    if (!jsonFormat) {
      return value;
    }
    const converter = DateConverter.of(jsonFormat.nativeAnnotation.pattern, jsonFormat.nativeAnnotation.locale);
    return converter.format(date);
  }

  private enhancedStringify(key: string, value: any, owner: object) {
    const clazz = owner?.constructor as ClazzType;
    const nativeValue = owner?.[key];
    const serializer = RuntimeAnnotation.getPropertyAnnotation(clazz, key, JsonSerialize)?.nativeAnnotation?.getSerializer?.();
    if (serializer) {
      // 自定义序列化
      return serializer.serialize(value);
    }
    if (nativeValue instanceof Date) {
      return this.dateStringify(nativeValue, clazz, key, value);
    } else if (value instanceof Map) {
      return this.mapTypeStringify(value);
    } else if (value instanceof Set) {
      return this.setTypeStringify(value);
    } else if (value instanceof TypedArray) {
      return this.typedArrayStringify(value);
    }
    return value;
  }
}
