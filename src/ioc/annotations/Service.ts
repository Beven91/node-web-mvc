/**
 * @module Service
 * @description 注册服务类型的bean到Ioc容器中
 */

import Target from "../../servlets/annotations/Target";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import DefaultListableBeanFactory from "../DefaultListableBeanFactory";
import BeanDefinition from "../BeanDefinition";
import BeanOptions from "./BeanOptions";

@Target
class Service {
  constructor(meta: RuntimeAnnotation, options: BeanOptions) {
    options = options || {};
    const beanFactory = DefaultListableBeanFactory.getInstance();
    const name = options.name || BeanOptions.toBeanName(meta.ctor.name);
    beanFactory.registerBeanDefinition(name, new BeanDefinition(meta.ctor));
  }
}

export default Target.install<typeof Service, BeanOptions>(Service);

