/**
 * @module AutowiredBeanProcessor
 * @description 自动装配处理
 */

import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Autowired from "../annotations/Autowired";
import { BeanDefinitonKey } from "../factory/BeanDefinitionRegistry";
import { BeanFactory } from "../factory/BeanFactory";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

export default class AutowiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessor {

  private readonly beanFactory: BeanFactory

  constructor(beanFactory: BeanFactory) {
    super();
    this.beanFactory = beanFactory;
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: object, beanName: BeanDefinitonKey): PropertyValue[] {
    const clazz = beanInstance.constructor;
    const annotations = RuntimeAnnotation.getAnnotations(Autowired, clazz);
    for (const annotation of annotations) {
      const componentAnno = annotation.nativeAnnotation;
      const clazzType = annotation.dataType;
      const hasDependency = this.beanFactory.containsBean(clazzType);
      pvs.push({
        name: annotation.name,
        // 将依赖属性的注入对象延迟至getter函数中，用于解决循环依赖，
        // @TODO 缺点： 注入异常不能在应用启动时发现，这点是否考虑用方案补偿?
        value: hasDependency && (() => {
          return this.beanFactory.getBean(clazzType);
        }),
        optional: componentAnno.required === false,
      })
    }
    return pvs;
  }
}