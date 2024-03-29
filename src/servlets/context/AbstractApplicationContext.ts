import { BeanFactory } from "../../ioc/factory/BeanFactory";

export default abstract class AbstractApplicationContext {

  abstract getBeanFactory(): BeanFactory

  obtainFreshBeanFactory() {
    return this.getBeanFactory();
  }

  refresh(){
    
  }
}
