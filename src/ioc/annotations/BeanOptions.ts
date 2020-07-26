export default class BeanOptions {

  static toBeanName(name) {
    return name.slice(0, 1).toLowerCase() + name.slice(1, name.length);
  }

  /**
   * 自定义bean名称,默认为当前class的名字
   */
  name?: string
}