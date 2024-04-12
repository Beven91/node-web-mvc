import { ClazzType } from "../../interface/declare";
import { BeanDefinitonKey } from "../factory/BeanDefinitionRegistry";

export default abstract class BeanPostProcessor {

  abstract postProcessBeforeInitialization?(beanType: ClazzType, beanName: BeanDefinitonKey): object

  abstract postProcessAfterInitialization(bean: object, beanName: BeanDefinitonKey): object
}