/**
 * @module ArgumentConverter
 * @description 解析出的参数转换
 */

import ArgumentConvertError from "../../../errors/ArgumentConvertError";
import Javascript from "../../../interface/Javascript";

export default class ArgumentConverter {

  private readonly dataType;

  constructor(dataType: any) {
    this.dataType = dataType;
  }

  isNull(v) {
    return v === null || v === undefined;
  }

  convert(value) {
    switch (this.dataType) {
      case BigInt:
        return this.toBigInt(value);
      case String:
        return this.isNull(value) ? '' : value.toString();
      case Number:
        return this.toNumber(value);
      case Boolean:
        return this.toBoolean(value);
      case Date:
        return this.toDate(value);
      case Map:
        return this.toMap(value);
      case Set:
        return this.toSet(value);
      case Array:
        return this.toArray(value);
      default:
        return this.toClass(value);
    }
  }

  toNumber(value) {
    if (isNaN(value)) {
      throw new ArgumentConvertError(value, Number);
    }
    return Number(value);
  }

  toBoolean(value) {
    if (typeof value === 'boolean') {
      return value;
    } else if (value == 0 || value === 'false') {
      return false;
    } else if (value == 1 || value === 'true') {
      return true;
    }
    throw new ArgumentConvertError(value, Boolean);
  }

  toBigInt(value) {
    try {
      return BigInt(value);
    } catch (ex) {
      throw new ArgumentConvertError(value, BigInt);
    }
  }

  toDate(value) {
    const date = new Date(value);
    if (/Invalid/.test(date.toString())) {
      throw new ArgumentConvertError(value, Date);
    }
    return date;
  }

  toArray(value) {
    if (!(value instanceof Array)) {
      throw new ArgumentConvertError(value, Array);
    }
    return value;
  }

  toMap(value) {
    if (typeof value !== 'object' || !value) {
      throw new ArgumentConvertError(value, Map);
    } else if (value instanceof Map) {
      return value;
    }
    const map = new Map();
    Object.keys(value).forEach((key) => {
      map.set(key, value[key]);
    });
    return map;
  }

  toSet(value) {
    if (!(value instanceof Array)) {
      throw new ArgumentConvertError(value, Set);
    } else if (value instanceof Set) {
      return value;
    }
    const data = new Set();
    value.forEach((item) => data.add(item));
    return data;
  }

  toClass(value) {
    const T = this.dataType as any;
    if (typeof T !== 'function' || value instanceof T) {
      return value;
    }
    if (this.dataType === Object) {
      return value;
    }
    const instance = new T();
    Object.keys(value).forEach((key) => {
      try {
        if (!Javascript.protoKeys[key]) {
          // 排除原型相关属性,这里只能赋值常规属性
          instance[key] = value[key];
        }
      } catch (ex) {
        if (ex.message.indexOf('which has only a getter') < 0) {
          throw new ArgumentConvertError(value, T, ex.message);
        }
      }
    });
    return instance;
  }
}