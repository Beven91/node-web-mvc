import { BeanFactory } from '../../ioc/factory/BeanFactory';
import DefaultListableBeanFactory from '../../ioc/factory/DefaultListableBeanFactory';
import AbstractApplicationContext from './AbstractApplicationContext';
import CglibAopProxyPostProcesor from '../../ioc/processor/CglibAopProxyPostProcesor';
import ApplicationContextAwareProcessor from '../../ioc/processor/ApplicationContextAwareProcessor';
import AutowiredAnnotationBeanPostProcessor from '../../ioc/processor/AutowiredAnnotationBeanPostProcessor';
import ConfigurationBeanPostProcessor from '../../ioc/processor/ConfigurationBeanPostProcessor';
import BootConfiguration from '../BootConfiguration';


export default class GenericApplicationContext extends AbstractApplicationContext {
  private readonly beanFactory: BeanFactory;

  private readonly bootConfig: BootConfiguration;

  constructor(bootConfig: BootConfiguration) {
    super();
    this.bootConfig = bootConfig;
    this.beanFactory = new DefaultListableBeanFactory();
  }

  getBootConfig(): BootConfiguration {
      return this.bootConfig;
  }

  registerBeanPostProcessor(): void {
    const factory = this.getBeanFactory();
    factory.addBeanPostProcessor(
      new ApplicationContextAwareProcessor(this),
      new AutowiredAnnotationBeanPostProcessor(factory),
      new ConfigurationBeanPostProcessor(factory),
      new CglibAopProxyPostProcesor(factory),
    );
  }

  getBeanFactory(): BeanFactory {
    return this.beanFactory;
  }
}
