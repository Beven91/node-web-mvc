import BeanDefinition from "../ioc/factory/BeanDefinition";


export default class BeanDefinitionOverrideException extends Error {

  public readonly definition: BeanDefinition

  public readonly overrideDefinition: BeanDefinition

  constructor(definition: BeanDefinition, overrideDefinition: BeanDefinition) {
    super();
    this.definition = definition;
    this.overrideDefinition = overrideDefinition;
    const p1 = definition.path;
    const p2 = overrideDefinition.path;
    this.message = `The bean 'getMyService', defined in [${p1}], could not be registered. A bean with that name has already been defined in [${p2}]  and overriding is disabled.`
  }
}