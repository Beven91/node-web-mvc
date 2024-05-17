/**
 * @module TypeConverter
 * @description 类型转换
 */

import ValueConvertError from "../../../errors/ValueConvertError";
import Javascript from "../../../interface/Javascript";

const isNull = (v: any) => v === null || v === undefined;

interface ConvertMapping {
  type: Function
  handler: (value: any) => any
}

const mappings: ConvertMapping[] = [
  {
    type: BigInt,
    handler: (value: any) => {
      try {
        return BigInt(value);
      } catch (ex) {
        throw new ValueConvertError(value, BigInt);
      }
    }
  },
  {
    type: String,
    handler: (value: any) => {
      return isNull(value) ? '' : value.toString();
    }
  },
  {
    type: Number,
    handler: (value: any) => {
      if (isNaN(value)) {
        throw new ValueConvertError(value, Number);
      }
      return Number(value);
    }
  },
  {
    type: Boolean,
    handler: (value: any) => {
      if (typeof value === 'boolean') {
        return value;
      } else if (value == 0 || value === 'false') {
        return false;
      } else if (value == 1 || value === 'true') {
        return true;
      }
      throw new ValueConvertError(value, Boolean);
    }
  },
  {
    type: Date,
    handler: (value: any) => {
      const date = new Date(value);
      if (/Invalid/.test(date.toString())) {
        throw new ValueConvertError(value, Date);
      }
      return date;
    }
  },
  {
    type: Array,
    handler: (value: any) => {
      if (!(value instanceof Array)) {
        throw new ValueConvertError(value, Array);
      }
      return value;
    }
  },
  {
    type: Map,
    handler: (value: any) => {
      if (typeof value !== 'object' || !value) {
        throw new ValueConvertError(value, Map);
      } else if (value instanceof Map) {
        return value;
      }
      const map = new Map();
      Object.keys(value).forEach((key) => {
        map.set(key, value[key]);
      });
      return map;
    }
  },
  {
    type: Set,
    handler: (value) => {
      if (!(value instanceof Array)) {
        throw new ValueConvertError(value, Set);
      } else if (value instanceof Set) {
        return value;
      }
      const data = new Set();
      value.forEach((item) => data.add(item));
      return data;
    }
  },
]

export default class TypeConverter {

  static getMapping(dataType: Function) {
    return mappings.find((m) => Javascript.getClass(m.type).isEqualOrExtendOf(dataType))
  }

  static support(dataType: Function) {
    return !!this.getMapping(dataType);
  }

  static convert(value: any, dataType: Function) {
    const mapping = this.getMapping(dataType);
    if (mapping) {
      return mapping.handler(value);
    }
    return this.toClass(value, dataType);
  }

  static toClass(value, dataType: Function) {
    const T = dataType as any;
    if (typeof T !== 'function' || value instanceof T) {
      return value;
    }
    if (dataType === Object) {
      return value;
    }
    const instance = new T();
    if (typeof value === 'object' && value) {
      Object.keys(value || {}).forEach((key) => {
        try {
          if (!Javascript.protoKeys[key]) {
            // 排除原型相关属性,这里只能赋值常规属性
            instance[key] = value[key];
          }
        } catch (ex) {
          if (ex.message.indexOf('which has only a getter') < 0) {
            throw new ValueConvertError(value, T, ex.message);
          }
        }
      });
    }
    return instance;
  }
}