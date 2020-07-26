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
    const name = options.name  || BeanOptions.toBeanName(meta.ctor.name);
    beanFactory.registerBeanDefinition(name, new BeanDefinition(meta.ctor));
  }
}

export default Target.install<typeof Repository, BeanOptions>(Repository);