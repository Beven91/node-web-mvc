/**
 * @module Assert
 * @description 断言工具集
 */

import Javascript from "../../interface/Javascript";

export default class Assert {

  /**
   * 断言:value必须为指定类型
   * @param value 值
   * @param ctor 类型
   */
  static isType(value, ctor, message?: string) {
    const typer = Javascript.createTyper(value?.constructor);
    if (!typer.isType(ctor)) {
      const type = Object.prototype.toString.call(value);
      const name = type.replace('[object ', '').replace(']', '');
      throw new Error(`[Assertion failed] - ${message || 'the value must be type:' + name}`);
    }
  }

  /**
   * 断言:传入参数需要为:null或者undefined
   */
  static isNull(value: any, message?: string) {
    if (!(value === null || value === undefined)) {
      throw new Error(`[Assertion failed] - ${message || 'the value argument must be null'}`);
    }
  }

  /**
   * 断言:传入参数应该不为:null或者undefined
   */
  static notNull(value: any, message?: string) {
    if (value === null || value === undefined) {
      throw new Error(`[Assertion failed] - ${message || 'the value argument must not be null'}`);
    }
  }

  /**
   * 断言:传入参数需要为:null或者undefined或者空字符串,或者空数组(length === 0)
   */
  static isEmpty(value: any, message?: string) {
    if (!(value === null || value === undefined || value === '' || value.length === 0)) {
      throw new Error(`[Assertion failed] - ${message || 'the value argument must be empty'}`);
    }
  }

  /**
   * 断言:传入参数应该不为:null或者undefined或者空字符串或者空数组(length === 0)
   */
  static notEmpty(value: any, message?: string) {
    if (value === null || value === '' || value === undefined || value.length === 0) {
      throw new Error(`[Assertion failed] - ${message || 'the value argument must not be empty'}`);
    }
  }

  /**
   * 断言:需要包含指定字符串
   * @param value 
   * @param include 
   * @param message 
   */
  static doesContain(value: string, include: string, message?: string) {
    value = (value || '').toString();
    if (value.indexOf(include) < 0) {
      throw new Error(`[Assertion failed] - ${message || 'the value argument dose contain: ' + include}`);
    }
  }

  /**
   * 断言: 不能包含指定字符串
   * @param value 
   * @param include 
   * @param message 
   */
  static doesNotContain(value: string, include: string, message?: string) {
    value = (value || '').toString();
    if (value.indexOf(include) > -1) {
      throw new Error(`[Assertion failed] - ${message || 'the value argument must does not contain: ' + include}`);
    }
  }

  /**
   * 断言: 数组项中不能存在空项(null,undefined)
   * @param value 
   * @param message 
   */
  static noNullElements(value: Array<any>, message?: string) {
    value = value || [];
    const find = value.filter((v) => (v === null || v === undefined));
    if (find.length > 0) {
      throw new Error(`[Assertion failed] - ${message || 'the value array must not contain null or undefined'}`);
    }
  }

  /**
   * 断言:value 必须为type的实例
   * @param value 
   * @param type 
   */
  static isInstanceOf(value: any, type: any, message?: string) {
    if (!(value instanceof type)) {
      const defaultMessage = message || `value must instanceof ${type.name}`;
      throw new Error(`[Assertion failed] - ${defaultMessage}`);
    }
  }
}