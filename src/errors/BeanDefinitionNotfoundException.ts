import { BeanDefinitonKey } from "../ioc/factory/BeanDefinitionRegistry";

export default class BeanDefinitionNotfoundException extends Error {

  constructor(beanName: BeanDefinitonKey) {
    super();
    const name = typeof beanName === 'string' ? beanName : beanName.name;
    this.message = `Cannot found BeanDefinition: ${name}`
  }
}