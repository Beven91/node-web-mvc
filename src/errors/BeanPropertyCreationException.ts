import BeanDefinition from "../ioc/factory/BeanDefinition";
import Exception from "./Exception";

export default class BeanPropertyCreationException extends Exception {

  constructor(definition: BeanDefinition, beanName: string, property: string, reason?: string) {
    super([
      `Bean property create fail${reason ? ' ' + reason : ''}`,
      '┌─────┐',
      `    bean: (${beanName}) ${definition.path}`,
      `    property: (${property}) --> beanName is null`,
      '└─────┘',
    ].join('\n'));
  }
}