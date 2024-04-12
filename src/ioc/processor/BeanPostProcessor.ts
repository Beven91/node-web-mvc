import { BeanDefinitonKey } from "../factory/BeanDefinitionRegistry";

export default abstract class BeanPostProcessor {

  /**
   * bean实例化后，初始化处理前执行
   * @param bean bean实例对象
   * @param beanName 当前bean在容器中的名称
   */
  postProcessBeforeInitialization?(bean: object, beanName: BeanDefinitonKey): object {
    return bean;
  }

  /**
   * bean实例化后，初始化处理后执行
   * @param bean 当前bean实例对象
   * @param beanName 当前bean在容器中的名称
   */
  postProcessAfterInitialization(bean: object, beanName: BeanDefinitonKey): object {
    return bean;
  }
}