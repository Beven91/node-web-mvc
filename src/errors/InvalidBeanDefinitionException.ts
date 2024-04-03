
export default class InvalidBeanDefinitionException extends Error {
  public definition: any;

  constructor(definition: any) {
    super('Invalid BeanDefinition');
    this.definition = definition;
  }
}