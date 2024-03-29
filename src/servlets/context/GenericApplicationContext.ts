import { BeanFactory } from "../../ioc/factory/BeanFactory";
import DefaultListableBeanFactory from "../../ioc/factory/DefaultListableBeanFactory";
import AbstractApplicationContext from "./AbstractApplicationContext";

export default class GenericApplicationContext extends AbstractApplicationContext {
  private readonly beanFactory: BeanFactory

  constructor() {
    super();
    this.beanFactory = new DefaultListableBeanFactory();
  }

  getBeanFactory(): BeanFactory {
    return this.beanFactory;
  }
}