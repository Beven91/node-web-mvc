import Exception from './Exception';

export default class InvalidBeanDefinitionException extends Exception {
  public definition: any;

  constructor(definition: any) {
    super('Invalid BeanDefinition');
    this.definition = definition;
  }
}
