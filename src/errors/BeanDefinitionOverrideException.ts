import BeanDefinition from "../ioc/factory/BeanDefinition";
import { BeanDefinitonKey } from "../ioc/factory/BeanDefinitionRegistry";


export default class BeanDefinitionOverrideException extends Error {

  constructor(beanName: BeanDefinitonKey, definition: BeanDefinition, overrideDefinition: BeanDefinition) {
    super();
    const name = typeof beanName === 'string' ? beanName : beanName.name;
    const p1 = definition.path;
    const p2 = overrideDefinition.path;
    this.message = `The bean '${name}', defined in [${p1}], could not be registered. \nA bean with that name has already been defined in [${p2}]  and overriding is disabled.`
  }
}