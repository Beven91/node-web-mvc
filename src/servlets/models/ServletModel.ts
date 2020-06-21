
/**
 * @module ServletModel 
 * @description 执行action的返回结果类
 */

export default class ServletModel {
  /**
   * 执行action后的返回结果
   */
  public data: any;

  /**
   * 构造一个请求执行结果类
   * @param data 返回结果的数据
   * @param type 标志当前结果类型
   */
  constructor(data) {
    if (data instanceof ServletModel) {
      return data;
    }
    this.data = data;
  }
}