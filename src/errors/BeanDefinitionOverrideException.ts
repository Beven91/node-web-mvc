import BeanDefinition from "../ioc/factory/BeanDefinition";
import Exception from "./Exception";

export default class BeanDefinitionOverrideException extends Exception {

  constructor(beanName: string, definition: BeanDefinition, overrideDefinition: BeanDefinition) {
    super();
    const p1 = definition.path;
    const p2 = overrideDefinition.path;
    this.message = `The bean '${beanName}', defined in [${p1}], could not be registered. \nA bean with that name has already been defined in [${p2}]  and overriding is disabled.`
  }
}