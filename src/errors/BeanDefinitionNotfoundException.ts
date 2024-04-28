export default class BeanDefinitionNotfoundException extends Error {

  constructor(beanName: string) {
    super();
    this.message = `Cannot found BeanDefinition: ${beanName}`
  }
}