import { BeanFactory } from '../../ioc/factory/BeanFactory';
import DefaultListableBeanFactory from '../../ioc/factory/DefaultListableBeanFactory';
import AbstractApplicationContext from './AbstractApplicationContext';
import CglibAopProxyPostProcesor from '../../ioc/processor/CglibAopProxyPostProcesor';
import ApplicationContextAwareProcessor from '../../ioc/processor/ApplicationContextAwareProcessor';
import AutowiredAnnotationBeanPostProcessor from '../../ioc/processor/AutowiredAnnotationBeanPostProcessor';
import ConfigurationBeanPostProcessor from '../../ioc/processor/ConfigurationBeanPostProcessor';


export default class GenericApplicationContext extends AbstractApplicationContext {
  private readonly beanFactory: BeanFactory;

  constructor() {
    super();
    this.beanFactory = new DefaultListableBeanFactory();
  }

  registerBeanPostProcessor(): void {
    const factory = this.getBeanFactory();
    factory.addBeanPostProcessor(
      new AutowiredAnnotationBeanPostProcessor(factory),
      new ApplicationContextAwareProcessor(this),
      new ConfigurationBeanPostProcessor(factory),
      new CglibAopProxyPostProcesor(factory),
    );
  }

  getBeanFactory(): BeanFactory {
    return this.beanFactory;
  }
}
