/**
 * @module Serialization
 * 序列化工具
 */

import { ClazzType } from "../../../interface/declare";
import TypeConverter from "./TypeConverter";

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
    return JSON.stringify(data, null, 2);
  }

}