/**
 * @module Serialization
 * 序列化工具
 */

import SerializationCreateInstanceError from "../../../errors/SerializationCreateInstanceError";
import { ClazzType } from "../../../interface/declare";

const OPEN_BRACE = '{'.charCodeAt(0);
const CLOSE_BRACE = '}'.charCodeAt(0);
const OPEN_BRACKET = '['.charCodeAt(0);
const CLOSE_BRACKET = ']'.charCodeAt(0);
const QUOTE = '"'.charCodeAt(0);
const SPACE = ' '.charCodeAt(0);
const NEW_LINE = '\n'.charCodeAt(0);
const CARRIAGE_RETURN = '\r'.charCodeAt(0);
const TAB = '\t'.charCodeAt(0);
const COLON = ':'.charCodeAt(0);
const COMMA = ','.charCodeAt(0);
const BACKSLASH = '\\'.charCodeAt(0);

const parentSymbol = Symbol('parent');
const indexSymbol = Symbol('index');
const RSymbols = {
  [QUOTE]: true,
  [TAB]: true,
  [NEW_LINE]: true,
}

const templates = {
  'b': '\b',
  'f': '\f',
  'n': '\n',
  'r': '\r',
  '"': '"',
  't': '\t',
}

export default class Serialization {

  /**
   * 反序列化json为指定类型对象
   */
  deserialize(str: string, dataType: Function | ClazzType) {
    // 基础类型转换
    // if (TypeConverter.support(dataType)) {
    //   return TypeConverter.convert(JSON.parse(str), dataType);
    // }
    return this.walk(str, dataType as ClazzType);
  }

  private walk(str: string, instanceType: ClazzType) {
    const instance = this.createInstance(instanceType, {});
    let currentKey = null;
    let currentOwner = instance;
    let rawValue = '';
    let isBackslash = false;
    let isQuoteOpened = false;
    const reset = () => {
      currentKey = '';
      rawValue = '';
    }
    // 转换class类型
    for (let i = 0, k = str.length; i < k; i++) {
      const code = str.charCodeAt(i);
      const char = String.fromCharCode(code);
      if (code == BACKSLASH) {
        isBackslash = true;
        continue;
      }
      if (isBackslash || (isQuoteOpened && !RSymbols[code])) {
        // 转义字符，直接拼接到rawValue
        rawValue = rawValue + this.parseString(char, isBackslash, isQuoteOpened);
        isBackslash = false;
        continue;
      }

      switch (code) {
        case OPEN_BRACE:
          rawValue = "";
          // 对象开始符{
          currentOwner = this.walkOpenObject(currentKey, currentOwner);
          break;
        case OPEN_BRACKET:
          // 数组开始字符符[
          currentOwner = this.walkOpenArray(currentKey, currentOwner);
          break;
        case QUOTE:
          isQuoteOpened = !isQuoteOpened;
          break;
        case CLOSE_BRACKET:
        // 数组结束符]
        case CLOSE_BRACE:
          // 对象结束符}
          {
            this.createOwnerValue(currentOwner, currentKey, rawValue);
            const oldOwner = currentOwner;
            currentOwner = currentOwner[parentSymbol];
            delete oldOwner[parentSymbol];
            reset();
          }
          break;
        case COMMA:
          // 值读取完毕
          this.createOwnerValue(currentOwner, currentKey, rawValue);
          reset();
          break;
        case COLON:
          // 属性名称读取完毕
          if (!isQuoteOpened) {
            currentKey = rawValue;
            rawValue = '';
          } else {
            rawValue = rawValue + char;
          }
          break;
        case SPACE:
        case TAB:
        case NEW_LINE:
        case CARRIAGE_RETURN:
          break;
        default:
          rawValue = rawValue + char;
          break;
      }
    }
    return instance;
  }

  private createOwnerValue(currentOwner: object, currentKey: string, currentValue: any) {
    if (!currentKey && currentValue === '') {
      return;
    }
    if (currentOwner instanceof Array) {
      currentOwner.push(currentValue);
    } else {
      currentOwner[currentKey] = currentValue;
    }
  }

  private createInstance(type: ClazzType, defaultInstance: object) {
    try {
      if (!type) {
        return defaultInstance;
      }
      return new type();
    } catch (ex) {
      throw new SerializationCreateInstanceError(type, ex.message);
    }
  }

  private parseString(char: string, isBackslash: boolean, isQuoteOpened: boolean) {
    if (!isBackslash || !isQuoteOpened) {
      return char;
    }
    return templates[char] || '\\' + char;
  }

  private walkOpenObject(key: string, owner: object) {
    if (key == null || !owner) {
      // 如果是第一层
      return owner;
    }
    const instanceType = owner.constructor;
    const defaultValue = instanceType.prototype[key];
    // 根据owner获取属性值类型
    const propertyType = null; // RuntimeAnnotation.getPropertyType(instanceType, key) || defaultValue?.constructor;
    const propertyInstance = this.createInstance(propertyType, {});
    propertyInstance[parentSymbol] = owner;
    this.createOwnerValue(owner, key, propertyInstance);
    return propertyInstance;
  }

  private walkOpenArray(key: string, owner: object) {
    if (key == null || !owner) {
      // 如果是第一层
      return owner;
    }
    const instance = [];
    instance[parentSymbol] = owner;
    this.createOwnerValue(owner, key, instance);
    return instance;
  }
}