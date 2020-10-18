/**
 * @module BeanFactory
 * @description ico 创建bean工厂
 */

export default interface BeanFactory {
  /**
   * 获取指定bean
   * @param {String} name bean类型名
   * @param {Array<any>} args 参数
   */
  getBean(name, ...args);

  getBeanOfType(beanType, ...args);
}