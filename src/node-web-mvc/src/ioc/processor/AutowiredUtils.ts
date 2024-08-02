import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import Qualifier from '../annotations/Qualifier';
import BeanDefinition from '../factory/BeanDefinition';

export function getBeanTypeByAnnotation(anno:RuntimeAnnotation) {
  const qualifier = RuntimeAnnotation.getAnnotationsByAnno(anno, Qualifier)[0];
  return qualifier?.nativeAnnotation?.value || BeanDefinition.toBeanName(anno.dataType);
}
