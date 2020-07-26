/**
 * @module Component
 * @description 注册服组件型的bean到Ioc容器中
 */

import Target from "../../servlets/annotations/Target";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import DefaultListableBeanFactory from "../DefaultListableBeanFactory";
import BeanDefinition from "../BeanDefinition";
import BeanOptions from "./BeanOptions";

@Target
class Component {

  constructor(meta: RuntimeAnnotation, options: BeanOptions) {
    options = options || {};
    const beanFactory = DefaultListableBeanFactory.getInstance();
    const name = options.name || BeanOptions.toBeanName(meta.ctor.name);
    beanFactory.registerBeanDefinition(name, new BeanDefinition(meta.ctor));
  }

}

export default Target.install<typeof Component, BeanOptions>(Component);