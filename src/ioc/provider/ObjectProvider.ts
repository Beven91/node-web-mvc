/**
 * @module ObjectProvider
 * @description bean创建
 */

export default interface ObjectProvider {

  /**
   * 创建指定作用域类型的bean
   * @param beanType  bean类类型
   * @param args 构造函数参数
   */
  createInstance(beanType: Function, args: Array<any>)

}