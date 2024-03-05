/**
 * @module RuntimeAnnotation
 * @description 运行时注解类
 */
import AnnotationOptions from "./AnnotationOptions";
import ElementType, { checkAnnotation } from "./ElementType";
import Javascript from "../../../interface/Javascript";

// 所有运行时注解
const runtimeAnnotations: Array<RuntimeAnnotation> = [];

export declare interface AnnotationFunction extends ClassDecorator, PropertyDecorator, MethodDecorator, ParameterDecorator {
}

type BaseAnnotation = AnnotationFunction

const isAnnotationOf = (m: RuntimeAnnotation, type) => {
  type = (type as any).Annotation || type;
  return m.nativeAnnotation instanceof type || m instanceof type
};

export default class RuntimeAnnotation {
  /**
   * 标注的类或者函数
   */
  public readonly target: Function

  /**
   * 标注类的构造函数
   */
  get ctor(): Function & { trace?: string[] } {
    switch (this.elementType) {
      case ElementType.TYPE:
        return this.target;
      default:
        return this.target.constructor;
    }
  }

  /**
   * 当前标注的方法
   */
  public get method() {
    const fn = this.elementType === ElementType.TYPE ? null : this.target[this.methodName];
    if (fn) {
      Object.defineProperty(fn, 'name', { value: this.methodName });
    }
    return fn;
  }

  public get methodName() {
    return this.name;
  }

  /**
   * 标注的函数
   */
  public readonly name: string

  /**
   * 标注参数的下表
   */
  public readonly paramIndex: number

  /**
   * 参数名称
   */
  public readonly paramName: string

  /**
   * 如果是标注在属性上，此属性会指向属性的descritpor
   */
  public readonly descriptor: any

  // 标注实例
  public readonly nativeAnnotation: any

  // 当前标注实际使用的类型
  public readonly elementType: ElementType

  public readonly trace: string[]

  public parameters: string[]

  /**
   * 如果当前注解为：函数注解，则能获取到返回结果类型
   */
  get returnType() {
    return Reflect.getMetadata('design:returntype', this.target, this.name);
  }

  /**
   * 如果当前为函数注解，则能获取到当前函数的参数类型
   */
  get paramTypes(){
    return Reflect.getMetadata('design:paramtypes', this.target, this.name) || [];
  }

  /**
   * 如果当前注解为参数注解，则能获取到当前参数的类型
   * @param ctor 
   */
  get paramType() {
    const paramtypes = this.paramTypes;
    return paramtypes[this.paramIndex];
  }

  /**
   * 当注解，作用在属性上时，的类型
   */
  get dataType() {
    return Reflect.getMetadata('design:type', this.target, this.name);
  }

  /**
   * 获取指定类的所有注解信息
   * @param {Function} ctor 被修饰的类 
   */
  static getClassAnnotations(ctor) {
    return runtimeAnnotations.filter((m) => m.ctor == ctor && m.elementType === ElementType.TYPE);
  }

  /**
   * 获取指定类下，指定类型的注解
   * @param {Function} ctor 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotationsOf<T>(ctor, type) {
    const annotations = this.getClassAllAnnotations(ctor).filter((m) => isAnnotationOf(m, type));
    return (annotations as any) as Array<T>
  }

  /**
   * 获取指定类的所有所有的注解信息（包括函数，属性，参数等)
   * @param {Function} ctor 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAllAnnotations(ctor) {
    return runtimeAnnotations.filter((m) => m.ctor == ctor);
  }

  /**
   * 获取指定类的指定类型的注解信息
   * @param {Function} ctor 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotation(ctor, type) {
    const annotations = this.getClassAnnotations(ctor);
    const isAnnotation = (s: RuntimeAnnotation) => s.elementType === ElementType.TYPE && isAnnotationOf(s, type);
    return annotations.find((m) => isAnnotation(m));
  }

  /**
   * 获取指定函数的注解
   * @param ctor 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotations(ctor: Function, method: string) {
    const isAnnotation = (s) => s.elementType === ElementType.METHOD && s.name === method;
    return this.getClassAllAnnotations(ctor).filter(isAnnotation);
  }

  /**
   * 获取指定函数的指定注解
   * @param ctor 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotation(ctor: Function, method: string, type: any) {
    const annotations = this.getMethodAnnotations(ctor, method);
    return annotations.find((m) => isAnnotationOf(m, type));
  }

  /**
   * 获取指定函数的参数注解
   * @param ctor 函数所在类 
   * @param method 函数名称
   */
  static getMethodParamAnnotations(ctor: Function, method: string) {
    const isAnnotation = (s) => s.elementType === ElementType.PARAMETER && s.name === method;
    return this.getClassAllAnnotations(ctor).filter(isAnnotation);
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
      annotations = annotations instanceof Array ? annotations : [annotations];
      const annotation = annotations.find((a) => isAnnotationOf(a, ctor));
      return annotation ? annotation.nativeAnnotation as T : null;
    }
  }

  /**
   * 创建一个运行时注解
   * @param { AnnotationOptions } options 注解参数
   */
  static create(options: AnnotationOptions, trace?: string[]) {
    // 创建一个运行时注解
    return new RuntimeAnnotation(options, trace);
  }

  constructor(options: AnnotationOptions, trace?: string[]) {
    const { meta, types, ctor: RealAnnotation } = options;
    // 检查范围
    const elementType = checkAnnotation(types, meta, RealAnnotation.name);

    // 设置当前标注的实际使用类型
    this.elementType = elementType as ElementType;

    const [target, name, descritpor] = meta;

    // 初始化元信息
    switch (elementType) {
      case ElementType.TYPE:
        this.target = target;
        break;
      case ElementType.METHOD:
        this.target = target;
        this.name = name;
        this.descriptor = descritpor;
        this.parameters = Javascript.resolveParameters(target[name]);
        break;
      case ElementType.PROPERTY:
        this.target = target;
        this.name = name;
        this.descriptor = descritpor;
        break;
      case ElementType.PARAMETER:
        {
          const parameters = Javascript.resolveParameters(target[name]);
          this.target = target;
          this.name = name;
          this.paramIndex = descritpor;
          this.paramName = parameters[this.paramIndex];
        }
        break;
    }

    this.ctor.trace = trace;

    // 根据构造创建注解实例
    this.nativeAnnotation = new RealAnnotation(this, ...options.options);

    // 将注解添加到注解列表
    runtimeAnnotations.push(this);
  }
}