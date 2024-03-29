
export default abstract class BeanPostProcessor {

  abstract postProcessBeforeInitialization(bean: Object, beanName: string): Object

  abstract postProcessAfterInitialization(bean: Object, beanName: string): Object

}