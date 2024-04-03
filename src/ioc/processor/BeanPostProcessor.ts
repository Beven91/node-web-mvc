import { ClazzType } from "../../servlets/annotations/annotation/RuntimeAnnotation";
import { BeanDefinitonKey } from "../factory/BeanDefinitionRegistry";

export default abstract class BeanPostProcessor {

  abstract postProcessBeforeInitialization?(beanType: ClazzType, beanName: BeanDefinitonKey): Object

  abstract postProcessAfterInitialization(bean: Object, beanName: BeanDefinitonKey): Object

}