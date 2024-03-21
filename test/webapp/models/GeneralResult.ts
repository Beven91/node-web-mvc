/**
 * @module GeneralResult
 * @description 接口统一返回结果
 */

import { ApiModel, ApiModelProperty } from "../../../src";
import Paged from "./Paged";

@ApiModel({ description: '返回结果' })
export default class GeneralResult<T> {

  /**
   * 返回的：业务编码 
   */
  @ApiModelProperty({ value: '编码' })
  public code: number

  /**
   * 返回的消息
   */
  @ApiModelProperty({ value: '消息' })
  public message: string

  /**
   * 返回的数据
   */
  @ApiModelProperty({ value: '数据', dataType: 'Paged<?>' })
  public data: Paged<T>

  /**
   * 构造一个统一返回结果实例
   * @param code 返回结果编码
   * @param data 返回数据
   * @param message 返回的消息
   */
  constructor(code, data?, message?: string) {
    this.code = code;
    this.message = message as string;
    this.data = data;
  }
}