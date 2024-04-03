import AbstractApplicationContext from "../../servlets/context/AbstractApplicationContext";
import ApplicationContextAware from "../../servlets/context/ApplicationContextAware";
import InstantiationAwareBeanPostProcessor, { PropertyValue } from "./InstantiationAwareBeanPostProcessor";

export default class ApplicationContextAwareProcessor extends InstantiationAwareBeanPostProcessor {

  private readonly context: AbstractApplicationContext

  constructor(context: AbstractApplicationContext) {
    super();
    this.context = context;
  }


  postProcessBeforeInitialization(beanType: Object, beanName: string): Object {
    return null;
  }

  postProcessProperties(pvs: PropertyValue[], beanInstance: Object, beanName: string): PropertyValue[] {
    return pvs;
  }

  postProcessAfterInitialization(beanInstance: Object, beanName: string): Object {
    if (beanInstance instanceof ApplicationContextAware && this.context) {
      beanInstance.setApplication?.(this.context);
    }
    return beanInstance;
  }
}