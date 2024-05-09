

// Tip: 由于ts运行时不能保留接口定义，所以在一些需要运行进行类型判定的地方会降接口改为抽象类来定义

import { ClazzType } from "../../interface/declare";
import BeanDefinition from "../factory/BeanDefinition";
import BeanPostProcessor from "./BeanPostProcessor";

export declare interface PropertyValue {
  name: string
  value: any
  optional: boolean
}

export default abstract class InstantiationAwareBeanPostProcessor extends BeanPostProcessor {

  /**
   * 实例化bean之前执行
   * @param beanClass bean类
   * @param beanName 当前bean在容器中的名称
   * @returns 如果返回了对象，则用于代替默认的实例对象
   */
  postProcessBeforeInstantiation(beanClass: ClazzType, beanName: string): object {
    return null;
  }

  /**
   * 实例化bean之后执行
   * @param instance bean实例对象
   * @param beanName 当前bean在容器中的名称
   * @returns 如果返回 false 则不进行属性设置，即不执行postProcessProperties
   */
  postProcessAfterInstantiation(instance: object, beanName: string): boolean {
    return true;
  }

  /**
   * 处理实例属性值
   * @param pvs 属性值列表
   * @param instance bean实例对象
   * @param beanName 当前bean在容器中的名称
   */
  postProcessProperties(pvs: PropertyValue[], instance: object, beanName: string, definition: BeanDefinition): PropertyValue[] {
    return pvs;
  }

}