import BeanDefinition from "../ioc/factory/BeanDefinition";


export default class BeanCreationException extends Error {

  definition: BeanDefinition

  beanName: string

  constructor(definition: BeanDefinition, beanName: string, message: string, nativeError: Error) {
    super(message);
    this.definition = definition;
    this.beanName = beanName;
    this.stack = this.stack + '\n\n' + nativeError.stack;
  }
}