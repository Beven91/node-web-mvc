import BeanDefinition from '../ioc/factory/BeanDefinition';
import Exception from './Exception';

export default class BeanCreationException extends Exception {
  definition: BeanDefinition;

  beanName: string;

  constructor(definition: BeanDefinition, beanName: string, message: string, nativeError: Error) {
    super(message);
    this.definition = definition;
    this.beanName = beanName;
    this.stack = this.stack + '\n\n' + nativeError.stack;
  }
}
