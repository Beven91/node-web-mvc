/**
 * @module Repository
 * @description 注册服组件型的bean到Ioc容器中
 */

import Target from "../../servlets/annotations/Target";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import BeanOptions from "./BeanOptions";
import BeanDefinition from "../BeanDefinition";
import DefaultListableBeanFactory from "../DefaultListableBeanFactory";

@Target
class Repository {

  constructor(meta: RuntimeAnnotation, options: BeanOptions) {
    options = options || {};
    const beanFactory = DefaultListableBeanFactory.getInstance();
    const definition = new BeanDefinition(meta.ctor);
    if (options.name) {
      beanFactory.registerBeanDefinition(name, definition);
    }
    beanFactory.registerBeanDefinition(BeanOptions.toBeanName(meta.ctor.name), definition);
    beanFactory.registerBeanDefinition(meta.ctor, definition);
  }
}

export default Target.install<typeof Repository, BeanOptions>(Repository);