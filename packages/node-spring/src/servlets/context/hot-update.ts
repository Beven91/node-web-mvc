import hot from 'nodejs-hmr';
import RuntimeAnnotation, { } from '../annotations/annotation/RuntimeAnnotation';
import Component from '../../ioc/annotations/Component';
import Tracer from '../annotations/annotation/Tracer';
import BeanDefinition from '../../ioc/factory/BeanDefinition';
import AbstractBeanFactory from '../../ioc/factory/AbstractBeanFactory';

// 开发模式热更新
export default function hotUpdate(
  getBeanFactory: () => AbstractBeanFactory,
  registerWithAnnotation: (annotation: RuntimeAnnotation) => void,
  createSingletonBeans: () => void
) {
  const updateFiles: string[] = [];
  const removeKeys: any[] = [];
  hot
    .create(module)
    .clean()
    .preload((old) => {
      updateFiles.push(old.filename);
      const beanFactory = getBeanFactory();
      for (const key of beanFactory.getBeanDefinitionNames()) {
        const definition = beanFactory.getBeanDefinition(key);
        const tracer = Tracer.getTracer(definition.clazz || definition.methodClazz);
        if (tracer?.isDependency?.(old.filename)) {
          // 记录需要移除的内容
          removeKeys.push(key);
        }
      }
    })
    .allDone(() => {
      const beanFactory = getBeanFactory();
      removeKeys.forEach((key) => {
        const definition = beanFactory.getBeanDefinition(key);
        if (definition) {
          // 移除Bean定义对应的实例对象
          beanFactory.removeBeanInstance(definition);
          // 移除Bean定义
          beanFactory.removeBeanDefinition(key);
        }
      });
      const annotations = RuntimeAnnotation.getAnnotations(Component);
      annotations.forEach((annotation) => {
        const tracer = Tracer.getTracer(annotation.ctor);
        const beanName = BeanDefinition.toBeanName(annotation.ctor);
        if (!tracer) return;
        if (!beanFactory.containsBean(beanName)) {
          // console.log('register:', annotation.ctor.name);
          // 重新注册热更新过的Bean定义
          registerWithAnnotation(annotation);
        }
      });
      createSingletonBeans();
      updateFiles.length = 0;
      removeKeys.length = 0;
    });
}
