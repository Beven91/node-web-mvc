/**
 * @module ModelAndView
 * @description 数据视图类,返回此结果，最终会使用指定模板来返回html内容
 */

export default class ModelAndView {

  /**
   * 视图名称
   */
  public view: string

  /**
   * 视图使用的模型数据
   */
  public model: any

  /**
   * 用来标识当前数据视图是否已清空
   */
  private cleared: boolean

  /**
   * 判断当前模型数据是否为空
   */
  public isEmpty() {
    return this.view == null && this.model == null;
  }

  /**
   * 判断当前模型是否已清空
   */
  public wasCleared() {
    return this.cleared && this.isEmpty;
  }

  /**
   * 数据视图实例
   * @param view 视图名称
   * @param model 视图数据
   */
  constructor(view: string, model?: any) {
    this.view = view;
    this.model = model;
  }

  /**
   * 清空实例数据
   */
  clear() {
    this.cleared = true;
    this.view = null;
    this.model = null;
  }

  /**
   * 添加一个属性到model中去
   */
  addObject(name,data){
    this.model = this.model || {};
    this.model[name] = data;
  }



}