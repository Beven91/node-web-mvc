import Exception from "./Exception";

export default class BeanDefinitionNotfoundException extends Exception {

  constructor(beanName: string) {
    super();
    this.message = `Cannot found BeanDefinition: ${beanName}`
  }
}