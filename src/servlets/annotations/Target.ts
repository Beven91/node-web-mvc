/**
 * @module Target
 * @description 用于标注指定类成为一个标注类
 */
import AnnotationOptions from "./annotation/AnnotationOptions";
import RuntimeAnnotation from "./annotation/RuntimeAnnotation";
import { reflectAnnotationType } from "./annotation/ElementType";

const elementTypes = Symbol('elementTypes');

export const parameterReturnable = Symbol('parameterReturnable');

/**
 * 标注指定类成为指定范围的注解类
 * @param types 
 */
export default function Target(types): any {
  if (types instanceof Array) {
    return (target) => {
      target[elementTypes] = types
    }
  }
}

Target.install = function <C, T>(target) {
  const decorator = function (a: T | Object | Function, b?: string | symbol, c?: any): any {
    const args = Array.prototype.slice.call(arguments);
    const runtime = new AnnotationOptions(target, args);
    const elementType = reflectAnnotationType(args);
    if (elementType === 'UNKNOW') {
      // 如果是执行配置，这里需要返回修饰器函数 例如:  @GetMapping('/home')
      return (...params) => {
        runtime.options = runtime.meta;
        runtime.meta = params;
        if (params[0] === parameterReturnable) {
          // 自定义元数据
          runtime.meta = params[1](runtime.options);
          // 创建注解
          return createAnnotation(runtime);
        }
        // 创建注解 此处不可返回
        createAnnotation(runtime);
      }
    }
    // 没有进行配置
    runtime.options = [];
    // 如果是按照如下方式使用注解 例如: @GetMapping
    createAnnotation(runtime);
  }
  decorator.Annotation = target as C;
  Object.defineProperty(decorator, 'name', { value: target.name });
  return decorator;
}

function createAnnotation(runtime: AnnotationOptions) {
  const target = runtime.meta[0];
  runtime.types = target[elementTypes] || target.constructor[elementTypes] || [];
  // 创建注解
  return RuntimeAnnotation.create(runtime)
}