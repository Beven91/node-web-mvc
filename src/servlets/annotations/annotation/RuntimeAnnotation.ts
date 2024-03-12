/**
 * @module RuntimeAnnotation
 * @description 运行时注解类
 */
import hot from 'nodejs-hmr';
import ElementType, { checkAnnotation, reflectAnnotationType } from "./ElementType";
import Javascript from "../../../interface/Javascript";
import Tracer from "./Tracer";
import FunctionExtends from "./FunctionExtends";

// 所有运行时注解
const runtimeAnnotations: Array<RuntimeAnnotation> = [];

export type GetTargetAnnotationType<T> = T extends { NativeAnnotation: abstract new (...args: any) => infer A } ? A : T extends abstract new (...args: any[]) => infer A ? A : T

export interface IAnnotationClazz {
  new(...args: any[]): any
}

export type LinkAnnotationType<A> = { NativeAnnotation: A }

export type TracerConstructor = Function & { tracer?: Tracer }

export interface IAnnotation extends Function, LinkAnnotationType<any> {
}

export type IAnnotationOrClazz = IAnnotationClazz | IAnnotation

const isAnnotationOf = (m: RuntimeAnnotation, type: IAnnotation | IAnnotationClazz) => {
  const nativeAnnotation = m.nativeAnnotation;
  const NativeAnnotation = (type as IAnnotation).NativeAnnotation;
  return nativeAnnotation instanceof type || (NativeAnnotation && nativeAnnotation instanceof NativeAnnotation);
};

export default class RuntimeAnnotation<A = any> {
  /**
   * 标注的类或者函数
   */
  public readonly target: Function

  /**
   * 标注类的构造函数
   */
  get ctor(): TracerConstructor {
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
  public readonly nativeAnnotation: A

  // 当前标注实际使用的类型
  public readonly elementType: ElementType

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
  get paramTypes() {
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

  static isHotUpdate: boolean

  /**
   * 获取指定类型的注解
   * @param type 注解类型
   */
  static getTypedRuntimeAnnotations<C extends IAnnotationClazz>(type: C) {
    return runtimeAnnotations.filter((m) => isAnnotationOf(m, type)) as RuntimeAnnotation<GetTargetAnnotationType<C>>[];
  }

  /**
   * 获取指定类的所有注解信息
   * @param {Function} clazz 被修饰的类 
   */
  static getClassAnnotations(clazz: Function) {
    return runtimeAnnotations.filter((m) => m.ctor == clazz && m.elementType === ElementType.TYPE);
  }

  /**
   * 获取指定类下，指定类型的注解
   * @param {Function} clazz 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotationsOf<C extends IAnnotationOrClazz>(clazz: Function, type: C) {
    return this.getClassAllAnnotations(clazz).filter((m) => isAnnotationOf(m, type)) as RuntimeAnnotation<GetTargetAnnotationType<C>>[];
  }

  /**
   * 获取指定类下，指定类型的第一个注解
   * @param {Function} clazz 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotationsOneOf<C extends IAnnotationOrClazz>(clazz: Function, type: C) {
    return this.getClassAllAnnotations(clazz).filter((m) => isAnnotationOf(m, type))[0] as RuntimeAnnotation<GetTargetAnnotationType<C>>;
  }

  /**
   * 获取指定类的所有所有的注解信息（包括函数，属性，参数等)
   * @param {Function} clazz 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAllAnnotations(clazz: Function) {
    return runtimeAnnotations.filter((m) => m.ctor == clazz);
  }

  /**
   * 获取指定类的指定类型的注解信息
   * @param {Function} clazz 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotation<C extends IAnnotationOrClazz>(clazz: Function, type: C) {
    const annotations = this.getClassAnnotations(clazz);
    const isAnnotation = (s: RuntimeAnnotation) => s.elementType === ElementType.TYPE && isAnnotationOf(s, type);
    return annotations.find((m) => isAnnotation(m)) as RuntimeAnnotation<GetTargetAnnotationType<C>>;
  }

  /**
   * 获取指定函数的注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotations(clazz: Function, method: string) {
    const isAnnotation = (s) => s.elementType === ElementType.METHOD && s.name === method;
    return this.getClassAllAnnotations(clazz).filter(isAnnotation);
  }

  /**
   * 获取指定函数的指定注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotation<C extends IAnnotationOrClazz>(clazz: Function, method: string, type: C) {
    const annotations = this.getMethodAnnotations(clazz, method);
    return annotations.find((m) => isAnnotationOf(m, type)) as RuntimeAnnotation<GetTargetAnnotationType<C>>;
  }

  /**
   * 获取指定函数的参数注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   */
  static getMethodParamAnnotations(clazz: Function, method: string) {
    const isAnnotation = (s) => s.elementType === ElementType.PARAMETER && s.name === method;
    return this.getClassAllAnnotations(clazz).filter(isAnnotation);
  }

  /**
   * 获取指定函数指定名称参数注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   * @param paramName 参数下标
   */
  static getMethodParamAnnotation<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string) {
    return this.getMethodAnnotations(clazz, method).find((s) => s.paramName === paramName) as RuntimeAnnotation<GetTargetAnnotationType<C>>;
  }

  /**
   * 从一组annotations中获取对应类型的注解
   * @param annotations 
   * @param ctor 
   */
  static getNativeAnnotation<T extends IAnnotation>(annotations: RuntimeAnnotation | RuntimeAnnotation[], ctor: T): GetTargetAnnotationType<T> | undefined {
    if (annotations) {
      annotations = annotations instanceof Array ? annotations : [annotations];
      const annotation = annotations.find((a) => isAnnotationOf(a, ctor));
      return annotation ? annotation.nativeAnnotation : null;
    }
  }

  /**
   * 创建一个运行时注解
   * @param { AnnotationOptions } options 注解参数
   */
  static create(elementTypes: ElementType | ElementType[], annotationType: IAnnotationClazz) {
    const types = elementTypes instanceof Array ? elementTypes : [elementTypes];
    const decorator = function () {
      const args = Array.prototype.slice.call(arguments);
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
          // if (params[0] === parameterReturnable) {
          //   // 自定义元数据
          //   runtime.meta = params[1](runtime.options);
          //   // 创建注解
          //   return createAnnotation(runtime);
          // }
          // 配置后创建注解
          new RuntimeAnnotation(params, annotationType, types, maybeInitializer, tracer);
        }
      }
      // 创建注解
      new RuntimeAnnotation(args, annotationType, types, {}, tracer);
    } as unknown as IAnnotation;
    decorator.NativeAnnotation = annotationType;
    FunctionExtends.extendStatic(decorator, annotationType);
    Object.defineProperty(decorator, 'name', { value: annotationType.name });
    return decorator;
  }

  constructor(meta: any[], NativeAnnotation: IAnnotationClazz, elementTypes: ElementType[], initializer: any, tracer?: Tracer) {
    const [target, name, descritpor] = meta;
    this.target = target;
    this.elementType = checkAnnotation(elementTypes, meta, NativeAnnotation.name);

    // 初始化元信息
    switch (this.elementType) {
      case ElementType.TYPE:
        break;
      case ElementType.METHOD:
        this.name = name;
        this.descriptor = descritpor;
        this.parameters = Javascript.resolveParameters(target[name]);
        break;
      case ElementType.PROPERTY:
        this.name = name;
        this.descriptor = descritpor;
        break;
      case ElementType.PARAMETER:
        this.name = name;
        this.paramIndex = descritpor;
        this.paramName = Javascript.resolveParameters(target[name])[this.paramIndex];
        break;
    }

    // 热更新追踪
    this.ctor.tracer = tracer
    // 根据构造创建注解实例
    this.nativeAnnotation = new NativeAnnotation(this, initializer);
    if (Object.prototype.toString.call(initializer) === '[object Object]') {
      // 自动将配置的值赋值到nativeAnnotation上
      Object.keys(initializer).forEach((key) => {
        this.nativeAnnotation[key] = initializer[key];
      })
    } else if (initializer) {
      (this.nativeAnnotation as any).value = initializer;
    }

    // 将注解添加到注解列表
    runtimeAnnotations.push(this);
  }
}

hot
  .create(module)
  .preload((old) => {
    const file = old.filename;
    const removeList = [] as any[];
    for (let element of runtimeAnnotations) {
      const ctor = element.ctor as TracerConstructor;
      if (ctor?.tracer?.isDependency(file)) {
        removeList.push(element);
      }
    }
    removeList.forEach((item) => {
      const index = runtimeAnnotations.indexOf(item);
      if (index > -1) {
        runtimeAnnotations.splice(index, 1);
      }
    });
  })