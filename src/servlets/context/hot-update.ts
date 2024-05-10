import hot from "nodejs-hmr";
import type AbstractApplicationContext from "./AbstractApplicationContext";
import RuntimeAnnotation, { } from "../annotations/annotation/RuntimeAnnotation";
import Component from "../../ioc/annotations/Component";
import Tracer from "../annotations/annotation/Tracer";
import BeanDefinition from "../../ioc/factory/BeanDefinition";

// 开发模式热更新
export default function hotUpdate(
  getBeanFactory: AbstractApplicationContext['getBeanFactory'],
  registerWithAnnotation: AbstractApplicationContext['registerWithAnnotation'],
  createSingletonBeans: AbstractApplicationContext['createSingletonBeans']
) {
  const updateFiles: string[] = [];
  const removeKeys: any[] = [];
  hot
    .create(module)
    .clean()
    .preload((old) => {
      updateFiles.push(old.filename);
      const beanFactory = getBeanFactory();
      for (let key of beanFactory.getBeanDefinitionNames()) {
        const definition = beanFactory.getBeanDefinition(key);
        const tracer = Tracer.getTracer(definition.clazz || definition.methodClazz);
        if (tracer?.isDependency?.(old.filename)) {
          // 记录需要移除的内容
          removeKeys.push(key);
        }
      }
    })
    .allDone((a) => {
      const beanFactory = getBeanFactory();
      // console.log('removeKeys', removeKeys);
      removeKeys.forEach((key) => {
        const definition = beanFactory.getBeanDefinition(key);
        if (definition) {
          // 移除Bean定义
          beanFactory.removeBeanDefinition(key);
          // 移除Bean定义对应的实例对象
          beanFactory.removeBeanInstance(definition.clazz);
        }
      })
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
    })
}
