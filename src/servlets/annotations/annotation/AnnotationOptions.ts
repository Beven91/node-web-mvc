import ElementType from "./ElementType";

export default class AnnotaionOptions {
  // 当前注解类
  ctor: any

  // 当前注解可使用的目标类型
  types: Array<ElementType>

  // 当前注解类使用所在目标(ElementType)的元数据信息
  meta: Array<any>

  // 当前注解类的构造参数
  options: Array<any>

  constructor(ctor, meta) {
    this.ctor = ctor;
    this.meta = meta;
  }
}