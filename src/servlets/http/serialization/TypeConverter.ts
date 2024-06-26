/**
 * @module TypeConverter
 * @description 类型转换
 */

import SerializationCreateInstanceError from "../../../errors/SerializationCreateInstanceError";
import ValueConvertError from "../../../errors/ValueConvertError";
import Javascript from "../../../interface/Javascript";
import { ClazzType } from "../../../interface/declare";
import RuntimeAnnotation from "../../annotations/annotation/RuntimeAnnotation";
import { toBigInt, toBoolean, toDate, toNumber, toString } from "./BasicTypeConverter";

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

  convert(value: object, type: any, itemType?: any) {
    if (value === null || value === undefined) {
      return null;
    } else if (!type) {
      throw new Error('dataType not present');
    }
    const clazzType = Javascript.createTyper(type);
    if (clazzType.isType(BigInt)) {
      return toBigInt(value);
    } else if (clazzType.isType(String)) {
      return toString(value, type)
    } else if (clazzType.isType(Number)) {
      return toNumber(value, type);
    } else if (clazzType.isType(Boolean)) {
      return toBoolean(value);
    } else if (clazzType.isType(Date)) {
      return toDate(value, type);
    } else if (clazzType.isType(Array)) {
      return this.toArray(value, type, itemType);
    } else if (clazzType.isType(Set)) {
      return this.toSet(value, type, itemType);
    } else if (clazzType.isType(Map)) {
      return this.toMap(value, type, itemType);
    } else if (value instanceof type) {
      return value;
    } else if (clazzType.isType(TypedArray)) {
      return this.toTypedArray(value, type);
    } else {
      return this.toClass(value, type, itemType);
    }
  }

  toSet(value: object, type: ClazzType, itemType?: any) {
    const set = new type() as Set<any>;
    const items = value instanceof Array ? value : [value];
    items.forEach((value) => {
      set.add(itemType ? this.convert(value, itemType) : value);
    })
    return set;
  }

  toMap(data: any, type: ClazzType, itemType?: any) {
    if (typeof data !== 'object' || !data || data instanceof Array) {
      throw new ValueConvertError(data, Map);
    }
    const map = new type() as Map<any, any>;
    Object.keys(data).forEach((key) => {
      const value = itemType ? this.convert(data[key], itemType) : data[key];
      map.set(key, value);
    });
    return map;
  }

  toArray(value: object, type: ClazzType, itemType?: any) {
    const values = value instanceof Array ? value : [value];
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

  toClass(data: object, dataType: ClazzType, itemType?: any) {
    const properties = RuntimeAnnotation.getClazzMetaPropertyAnnotations(dataType);
    const instance = this.createInstance(dataType);
    const keys = Object.keys(data);
    for (const key of keys) {
      const value = data[key];
      const descriptor = this.getDescriptor(instance, key) || {};
      if (descriptor.writable === false || ('set' in descriptor && descriptor.set == undefined)) {
        // 如果是只读属性
        continue;
      }
      const anno = properties[key];
      if (!anno) {
        instance[key] = value;
      } else {
        instance[key] = this.convert(value, anno.dataType, anno.nativeAnnotation.itemType);
      }
    }
    return instance;
  }
}
