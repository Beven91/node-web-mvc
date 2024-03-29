import BeanPostProcessor from "./BeanPostProcessor";


export default class CommonAnnotationBeanPostProcessor implements BeanPostProcessor {
  postProcessBeforeInitialization(bean: Object, beanName: string): Object {
    throw new Error("Method not implemented.");
  }
  postProcessAfterInitialization(bean: Object, beanName: string): Object {
    throw new Error("Method not implemented.");
  }
  
}