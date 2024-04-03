

// Tip: 由于ts运行时不能保留接口定义，所以在一些需要运行进行类型判定的地方会降接口改为抽象类来定义

import { BeanDefinitonKey } from "../factory/BeanDefinitionRegistry";
import BeanPostProcessor from "./BeanPostProcessor";

export declare interface PropertyValue {
  name: string
  value: any
  optional: boolean
}

export default abstract class InstantiationAwareBeanPostProcessor implements BeanPostProcessor {

  abstract postProcessBeforeInitialization(beanType: Object, beanName: string): Object

  abstract postProcessAfterInitialization(beanInstance: Object, beanName: string): Object

  abstract postProcessProperties(pvs: PropertyValue[], beanInstance: Object, beanName: string): PropertyValue[]

}