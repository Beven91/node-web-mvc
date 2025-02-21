/**
 * @module TypeConverter
 * @description 类型转换
 */

import SerializationCreateInstanceError from '../errors/SerializationCreateInstanceError';
import ValueConvertError from '../errors/ValueConvertError';
import Javascript from '../interface/Javascript';
import { ClazzType } from '../interface/declare';
import RuntimeAnnotation from '../servlets/annotations/annotation/RuntimeAnnotation';
import { toBigInt, toBoolean, toDate, toNumber, toString } from './BasicTypeConverter';
import DateConverter from './date/DateConverter';
import JsonDeserialize from './JsonDeserialize';
import JsonFormat from './JsonFormat';
import { MetaRuntimeTypeInfo } from '../servlets/annotations/annotation/type';
import ConvertPropertyTypeError from '../errors/ConvertPropertyTypeError';

export const TypedArray = (Uint8Array.prototype as any).__proto__.constructor;

export default class TypeConverter {
  private createInstance(type: ClazzType, ...args: any[]) {
    try {
      if (!type) {
        return null;
      }
      return new type(...args);
    } catch (ex) {
      throw new SerializationCreateInstanceError(type, ex.message);
    }
  }

  private isInstanceof(v: any, type: ClazzType): boolean {
    return (typeof v === 'object' && !!v && v instanceof type);
  }

  convert(value: object, type: ClazzType, runtimeType?: MetaRuntimeTypeInfo) {
    if (value === null || value === undefined) {
      return null;
    } else if (!type) {
      return value;
      // throw new Error(`dataType not present`);
    }
    const clazzType = Javascript.createTyper(type);
    if (runtimeType?.enum) {
      return this.toEnum(value, type);
    } else if (clazzType.isType(BigInt)) {
      return toBigInt(value);
    } else if (clazzType.isType(String)) {
      return toString(value, type);
    } else if (clazzType.isType(Number)) {
      return toNumber(value, type);
    } else if (clazzType.isType(Boolean)) {
      return toBoolean(value);
    } else if (clazzType.isType(Date)) {
      return toDate(value, type);
    } else if (clazzType.isType(Array)) {
      return this.toArray(value, type, runtimeType);
    } else if (clazzType.isType(Set) || clazzType.isType(WeakSet)) {
      return this.toSet(value, type, runtimeType);
    } else if (clazzType.isType(Map) || clazzType.isType(WeakMap)) {
      return this.toMap(value, type, runtimeType);
    } else if (this.isInstanceof(value, type)) {
      return value;
    } else if (clazzType.isType(TypedArray)) {
      return this.toTypedArray(value, type);
    } else if (runtimeType?.array) {
      return this.toArray(value, Array, { args: [ runtimeType ], clazz: Array, name: 'Array', array: true, fullName: 'Array' });
    } else {
      return this.toClass(value, type, runtimeType);
    }
  }

  toEnum(value: any, type: object) {
    if (value in type) {
      return value;
    }

    throw new Error(`${value} is not enum value`);
  }

  toSet(value: object, type: ClazzType, runtimeType?: MetaRuntimeTypeInfo) {
    const set = new type() as Set<any>;
    const items = value instanceof Array ? value : [ value ];
    const itemType = runtimeType?.args?.[0]?.clazz;
    items.forEach((value) => {
      set.add(itemType ? this.convert(value, itemType) : value);
    });
    return set;
  }

  toMap(data: any, type: ClazzType, runtimeType?: MetaRuntimeTypeInfo) {
    if (typeof data !== 'object' || !data || data instanceof Array) {
      throw new ValueConvertError(data, Map);
    }
    const itemType = runtimeType?.args?.[1]?.clazz;
    const map = new type() as Map<any, any>;
    Object.keys(data).forEach((key) => {
      const value = itemType ? this.convert(data[key], itemType) : data[key];
      map.set(key, value);
    });
    return map;
  }

  toArray(value: object, type: ClazzType, runtimeType?: MetaRuntimeTypeInfo) {
    const values = value instanceof Array ? value : [ value ];
    const itemType = runtimeType?.args?.[0]?.clazz;
    const instance = this.createInstance(type);
    if (value == null) {
      return instance;
    } else if (itemType) {
      values.forEach((item, i) => {
        instance[i] = this.convert(item, itemType);
      });
    } else {
      values.forEach((item, i) => {
        instance[i] = item;
      });
    }
    return instance;
  }

  toTypedArray(data: any, type: ClazzType) {
    return new type(data) as Uint8Array;
  }

  private getDescriptor(instance: any, key: string) {
    if (!instance) return null;
    return Object.getOwnPropertyDescriptor(instance, key) || Object.getOwnPropertyDescriptor(instance.__proto__, key);
  }

  toClass(data: object, dataType: ClazzType, runtimeType?: MetaRuntimeTypeInfo) {
    // TODO:  runtimeType补充
    if (dataType === Object && (typeof data !== 'object' || !data)) {
      return data;
    }
    const instance = this.createInstance(dataType);
    const keys = Object.keys(data);
    for (const key of keys) {
      const value = data[key];
      const descriptor = this.getDescriptor(instance, key) || {};
      if (descriptor.writable === false || ('set' in descriptor && descriptor.set == undefined)) {
        // 如果是只读属性
        continue;
      }
      try {
        instance[key] = this.handlePropertyValue(dataType, key, value);
      } catch (ex) {
        throw new ConvertPropertyTypeError(key, ex);
      }
    }
    return instance;
  }

  private handlePropertyValue(clazz: ClazzType, name: string, value: any) {
    const basicProperty = RuntimeAnnotation.getPropertyAnnotations(clazz, name)[0];
    if (!basicProperty) {
      return value;
    }
    const deserializer = RuntimeAnnotation.getPropertyAnnotation(clazz, name, JsonDeserialize)?.nativeAnnotation?.getDeserializer?.();
    if (deserializer) {
      // 自定义反序列化
      return deserializer.deserialize(value, clazz, name);
    }
    const clazzType = basicProperty.dataType.clazz;
    if (Javascript.createTyper(clazzType).isType(Date)) {
      return this.handleDateProperty(clazz, clazzType, name, value);
    }
    const metaProperty = RuntimeAnnotation.getPropertyAnnotation(clazz, name, Object);
    return this.convert(value, clazzType, metaProperty?.dataType);
  }

  private handleDateProperty(clazz: ClazzType, dataType: ClazzType, name: string, value: any) {
    const jsonFormat = RuntimeAnnotation.getPropertyAnnotation(clazz, name, JsonFormat);
    if (!jsonFormat) {
      return toDate(value, dataType);
    }
    const converter = DateConverter.of(jsonFormat.nativeAnnotation.pattern, jsonFormat.nativeAnnotation.locale);
    return converter.parse(value);
  }
}
