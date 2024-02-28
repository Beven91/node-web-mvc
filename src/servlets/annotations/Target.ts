/**
 * @module Target
 * @description 用于标注指定类成为一个标注类
 */
import AnnotationOptions from "./annotation/AnnotationOptions";
import RuntimeAnnotation, { AnnotationFunction } from "./annotation/RuntimeAnnotation";
import { reflectAnnotationType } from "./annotation/ElementType";

const elementTypes = Symbol('elementTypes');
const moduleRuntime = { generate: false }

declare type ConfigableDecorator<T> = (a: T) => any

type AbstractClassType = abstract new (...args: any) => any

export const parameterReturnable = Symbol('parameterReturnable');

export declare type ReturnableAnnotationFunction<T> = (a: typeof parameterReturnable, callback: Function) => T

export declare interface CallableAnnotationFunction<A, T> extends ConfigableDecorator<T>, AnnotationFunction<A> {
  Annotation: A
}

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

Target.generateTrace = function () {
  moduleRuntime.generate = true;
}

Target.install = function <A extends AbstractClassType>(ctor: A): CallableAnnotationFunction<A, ConstructorParameters<A>[1]> {
  const decorator = function () {
    const args = Array.prototype.slice.call(arguments);
    const runtime = new AnnotationOptions(ctor, args);
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
  decorator.Annotation = ctor;
  Object.defineProperty(decorator, 'name', { value: (ctor as any).name });
  return decorator as any;
}

function getTrace(error: Error) {
  return error.stack.split('\n').slice(4, 6).map((m) => m.split('(').pop().split(':').shift());
}

function createAnnotation(runtime: AnnotationOptions): RuntimeAnnotation {
  const target = runtime.meta[0];
  runtime.types = target[elementTypes] || target.constructor[elementTypes] || [];
  // 创建注解
  return RuntimeAnnotation.create(runtime, moduleRuntime.generate ? getTrace(new Error()) : null)
}