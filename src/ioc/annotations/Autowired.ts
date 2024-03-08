/**
 * @module Autowired
 * @description 自动装配注解，可用于装配类的构造函数，以及属性，方法。
 */

import Target from "../../servlets/annotations/Target";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import AutowiredBeanProcessor, { AutowiredOptions } from "../AutowiredBeanProcessor";

class Autowired {
  constructor(meta: RuntimeAnnotation, options: AutowiredOptions = {}) {
    options = new AutowiredOptions(options);
    switch (meta.elementType) {
      case ElementType.PROPERTY:
        AutowiredBeanProcessor.processPropertyBean(meta, options);
        break;
        // case ElementType.METHOD:
        //   AutowiredBeanProcessor.processMethodBeans(meta, options);
        break;
    }
  }
}

// 公布注解
export default Target(ElementType.PROPERTY)(Autowired);