/**
 * @module RuntimeAnnotation
 * @description 运行时注解类
 */
import AnnotationOptions from "./AnnotationOptions";
import ElementType, { checkAnnotation } from "./ElementType";
import Javascript from "../../../interface/Javascript";

// 所有运行时注解
const runtimeAnnotations: Array<RuntimeAnnotation> = [];

export declare interface AnnotationFunction<A> extends ClassDecorator, PropertyDecorator, MethodDecorator, ParameterDecorator {
  Annotation: A
}

type BaseAnnotation = AnnotationFunction<any>

export default class RuntimeAnnotation {
  /**
   * 标注的类
   */
  target: Function

  /**
   * 标注类的构造函数
   */
  get ctor(): Function {
    switch (this.elementType) {
      case ElementType.TYPE:
        return this.target;
      default:
        return this.target.constructor;
    }
  }

  /**
   * 标注的函数
   */
  name: string

  /**
   * 标注参数的下表
   */
  paramIndex: number

  /**
   * 参数名称
   */
  paramName: string

  /**
   * 如果是标注在属性上，此属性会指向属性的descritpor
   */
  descriptor: any

  // 标注实例
  nativeAnnotation: any

  // 当前标注实际使用的类型
  elementType: ElementType

  /**
   * 如果当前注解为：函数注解，则能获取到返回结果类型
   */
  get returnType() {
    return Reflect.getMetadata('design:returntype', this.target, this.name);
  }

  /**
   * 如果当前注解为参数注解，则能获取到当前参数的类型
   * @param ctor 
   */
  get paramType() {
    const paramtypes = Reflect.getMetadata('design:paramtypes', this.target, this.name) || [];
    return paramtypes[this.paramIndex];
  }

  /**
   * 获取指定类的所有注解信息
   * @param {Function} ctor 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotations(ctor) {
    return runtimeAnnotations.filter((m) => m.target = ctor || m.target.constructor === ctor);
  }

  /**
   * 获取指定类的指定类型的注解信息
   * @param {Function} ctor 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotation(ctor, type) {
    const isAnnotation = (m) => m.target === ctor && m.nativeAnnotation instanceof type;
    return runtimeAnnotations.find(isAnnotation);
  }

  /**
   * 获取指定函数的注解
   * @param ctor 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotations(ctor: Function, method: string) {
    const isAnnotation = (s) => s.elementType === ElementType.METHOD && s.name === method;
    return this.getClassAnnotations(ctor).filter(isAnnotation);
  }

  /**
   * 获取指定函数的参数注解
   * @param ctor 函数所在类 
   * @param method 函数名称
   */
  static getMethodParamAnnotations(ctor: Function, method: string) {
    const isAnnotation = (s) => s.elementType === ElementType.PARAMETER && s.name === method;
    return this.getClassAnnotations(ctor).filter(isAnnotation);
  }

  /**
   * 获取指定函数指定名称参数注解
   * @param ctor 函数所在类 
   * @param method 函数名称
   * @param paramName 参数下标
   */
  static getMethodParamAnnotation(ctor: Function, method: string, paramName: string) {
    return this.getMethodAnnotations(ctor, method).find((s) => s.paramName === paramName);
  }

  /**
   * 从一组annotations中获取对应类型的注解
   * @param annotations 
   * @param ctor 
   */
  static getNativeAnnotation<T>(annotations: Array<RuntimeAnnotation> | RuntimeAnnotation, ctor: BaseAnnotation | RuntimeAnnotation): T {
    if (annotations) {
      const Annotation = (ctor as any).Annotation || ctor;
      annotations = annotations instanceof Array ? annotations : [annotations];
      const annotation = annotations.find((a) => a.nativeAnnotation instanceof Annotation);
      return annotation ? annotation.nativeAnnotation as T : null;
    }
  }

  /**
   * 创建一个运行时注解
   * @param { AnnotationOptions } options 注解参数
   */
  static create(options: AnnotationOptions) {
    const { meta, types, ctor: RealAnnotation } = options;
    // 检查范围
    const elementType = checkAnnotation(types, meta, RealAnnotation.name);
    // 创建一个运行时注解
    const runtimeAnnotation = new RuntimeAnnotation();
    // 设置当前标注的实际使用类型
    runtimeAnnotation.elementType = elementType as ElementType;

    const [target, name, descritpor] = meta;

    // 初始化元信息
    switch (elementType) {
      case ElementType.TYPE:
        runtimeAnnotation.target = target;
        break;
      case ElementType.METHOD:
        runtimeAnnotation.target = target;
        runtimeAnnotation.name = name;
        runtimeAnnotation.descriptor = descritpor;
        break;
      case ElementType.PROPERTY:
        runtimeAnnotation.target = target;
        runtimeAnnotation.name = name;
        runtimeAnnotation.descriptor = descritpor;
        break;
      case ElementType.PARAMETER:
        {
          const parameters = Javascript.resolveParameters(target[name]);
          runtimeAnnotation.target = target;
          runtimeAnnotation.name = name;
          runtimeAnnotation.paramIndex = descritpor;
          runtimeAnnotation.paramName = parameters[runtimeAnnotation.paramIndex];
        }
        break;
    }

    // 根据构造创建注解实例
    runtimeAnnotation.nativeAnnotation = new RealAnnotation(runtimeAnnotation, ...options.options);

    // 将注解添加到注解列表
    runtimeAnnotations.push(runtimeAnnotation);

    return runtimeAnnotation;
  }
}