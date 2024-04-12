import Aware from "./Aware";
import { BeanFactory } from "./BeanFactory";

export default abstract class BeanFactoryAware extends Aware {

  abstract setBeanFactory(factory: BeanFactory): void

}