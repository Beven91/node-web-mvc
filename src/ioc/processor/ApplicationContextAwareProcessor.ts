import AbstractApplicationContext from "../../servlets/context/AbstractApplicationContext";
import ApplicationContextAware from "../../servlets/context/ApplicationContextAware";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

export default class ApplicationContextAwareProcessor extends InstantiationAwareBeanPostProcessor {
  
  private readonly context: AbstractApplicationContext

  constructor(context: AbstractApplicationContext) {
    super();
    this.context = context;
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: object, beanName: string): PropertyValue[] {
    if (beanInstance instanceof ApplicationContextAware && this.context) {
      beanInstance.setApplication?.(this.context);
    }
    return pvs;
  }
}