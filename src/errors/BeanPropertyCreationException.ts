

export default class BeanPropertyCreationException extends Error {

  constructor(beanName: string,property:string) {
    super(`BeanPostProcessor create bean(${beanName}) property(${property}) fail`);
  }
}