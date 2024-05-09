import Autowired from "../ioc/annotations/Autowired";
import BeanDefinition from "../ioc/factory/BeanDefinition";
import { getBeanTypeByAnnotation } from "../ioc/processor/AutowiredUtils";
import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import Exception from "./Exception";

export interface DependencyBeanDefinition {
  beanName: string
  definition: BeanDefinition
}

export default class LoopDependenciesException extends Exception {

  constructor(creationChains: DependencyBeanDefinition[]) {
    super('LoopDependenciesException');
    const chains = creationChains;
    const message = [
      '\nThe dependencies of some of the beans in the application context form a cycle:\n',
      '┌─────┐',
      chains.map(({ beanName, definition }, i) => {
        const autowireds = RuntimeAnnotation.getAnnotations(Autowired,definition.clazz);
        const next = chains[i + 1] || chains[0];
        const property = autowireds.find((m)=>{
          const beanName = getBeanTypeByAnnotation(m);
          return beanName == next.beanName;
        });
        return `|    ${beanName} (${definition.path} >>> ${definition.clazz.name}.${property?.name})`
      }).join('\n↑     ↓\n'),
      '└─────┘',
    ].join('\n');
    const stack = this.stack;
    this.stack = message + '\n ' + stack;
  }
}