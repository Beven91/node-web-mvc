import ElementType, { reflectAnnotationType } from "./ElementType";
import FunctionExtends from "./FunctionExtends";
import type { IAnnotation, IAnnotationClazz } from "./RuntimeAnnotation";
import RuntimeAnnotation from "./RuntimeAnnotation";
import Tracer from "./Tracer";

function parseArguments(args: any[]) {
  const mayAnnotation = args[args.length - 1];
  if (mayAnnotation instanceof RuntimeAnnotation) {
    return {
      args: args.slice(0, -1),
      ownerAnnotation: mayAnnotation
    }
  }
  return {
    args,
    ownerAnnotation: null
  }
}

/**
 * 创建一个运行时注解
 * @param { AnnotationOptions } options 注解参数
 */
export default function create(elementTypes: ElementType | ElementType[], annotationType: IAnnotationClazz) {
  const types = elementTypes instanceof Array ? elementTypes : [elementTypes];
  const decorator = function () {
    const { args, ownerAnnotation } = parseArguments(Array.prototype.slice.call(arguments));
    if (this instanceof decorator) {
      // 如果是当做class使用,这里用于从外部继承原始的AnnotationType
      return FunctionExtends.extendInstance(this, annotationType, args, decorator);
    }
    const tracer = RuntimeAnnotation.isHotUpdate ? new Tracer(new Error()) : null;
    const maybeInitializer = args[0];
    const elementType = reflectAnnotationType(args);
    if (elementType === 'UNKNOW') {
      // 如果是执行配置，这里需要返回修饰器函数 例如:  @GetMapping('/home')
      return (...params) => {
        const innerInfo = parseArguments(params);
        // 配置后创建注解
        new RuntimeAnnotation(innerInfo.args, annotationType, types, maybeInitializer, tracer, innerInfo.ownerAnnotation);
      }
    }
    // 创建注解
    new RuntimeAnnotation(args, annotationType, types, {}, tracer, ownerAnnotation);
  } as unknown as IAnnotation;
  decorator.NativeAnnotation = annotationType;
  FunctionExtends.extendStatic(decorator, annotationType);
  Object.defineProperty(decorator, 'name', { value: annotationType.name });
  return decorator;
}