/**
 * @module AutowiredBeanProcessor
 * @description 自动装配处理
 */

import BeanPropertyCreationException from "../../errors/BeanPropertyCreationException";
import ElementType from "../../servlets/annotations/annotation/ElementType";
import RuntimeAnnotation from "../../servlets/annotations/annotation/RuntimeAnnotation";
import Autowired from "../annotations/Autowired";
import BeanDefinition from "../factory/BeanDefinition";
import { BeanFactory } from "../factory/BeanFactory";
import { getBeanTypeByAnnotation } from "./AutowiredUtils";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

export default class AutowiredAnnotationBeanPostProcessor extends InstantiationAwareBeanPostProcessor {

  private readonly beanFactory: BeanFactory

  constructor(beanFactory: BeanFactory) {
    super();
    this.beanFactory = beanFactory;
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: object, beanName: string, definition: BeanDefinition): PropertyValue[] {
    const clazz = beanInstance.constructor;
    const annotations = RuntimeAnnotation.getAnnotations(Autowired, clazz);
    for (const annotation of annotations) {
      if (annotation.elementType !== ElementType.PROPERTY) {
        continue;
      }
      const proprty = annotation.name;
      const componentAnno = annotation.nativeAnnotation;
      const optional = componentAnno.required === false;
      const clazzType = getBeanTypeByAnnotation(annotation);
      if (!clazzType) {
        throw new BeanPropertyCreationException(definition, beanName, proprty, `beanName is null`);
      }
      pvs.push({
        optional,
        name: proprty,
        value: this.beanFactory.getBean(clazzType),
      })
    }
    return pvs;
  }
}