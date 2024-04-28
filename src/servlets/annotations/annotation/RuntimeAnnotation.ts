/**
 * @module RuntimeAnnotation
 * @description 运行时注解类
 */
import hot from 'nodejs-hmr';
import ElementType, { checkAnnotation } from "./ElementType";
import Javascript from "../../../interface/Javascript";
import Tracer from "./Tracer";
import { mergeAnnotationSymbol } from '../Merge';
import AliasFor from '../AliasFor';
import { ClazzType } from '../../../interface/declare';

// 所有运行时注解
const runtimeAnnotations: Array<RuntimeAnnotation> = [];

export type GetTargetAnnotationType<T> = T extends { NativeAnnotation: abstract new (...args: any) => infer A } ? A : T extends abstract new (...args: any[]) => infer A ? A : T

export interface IAnnotationClazz {
  new(...args: any[]): any
}

export type LinkAnnotationType<A> = { NativeAnnotation: A }

export interface IAnnotation extends Function, LinkAnnotationType<any> {
}

export type IAnnotationOrClazz = IAnnotationClazz | IAnnotation

const isAnnotationTypeOf = (m: RuntimeAnnotation, type: IAnnotation | IAnnotationClazz) => {
  const nativeAnnotation = m.nativeAnnotation;
  const NativeAnnotation = (type as IAnnotation).NativeAnnotation;
  return nativeAnnotation instanceof type || (NativeAnnotation && nativeAnnotation instanceof NativeAnnotation);
};

const isMatchType = (m: RuntimeAnnotation, clazz: Function) => {
  if (m.ctor === clazz) {
    return true;
  }
  return Javascript.getClass(clazz).isExtendOf(m.ctor);
}

export default class RuntimeAnnotation<A = any> {

  private readonly meta: any[]

  /**
   * 标注的类或者函数
   */
  public readonly target: Function

  /**
   * 标注类的构造函数
   */
  get ctor() {
    switch (this.elementType) {
      case ElementType.TYPE:
        return this.target as ClazzType
      default:
        return this.target.constructor as ClazzType
    }
  }

  /**
   * 当前标注的方法
   */
  public get method(): Function {
    const fn = this.elementType === ElementType.TYPE ? null : this.target[this.methodName];
    if (fn) {
      Object.defineProperty(fn, 'name', { value: this.methodName });
    }
    return fn;
  }

  public readonly methodName

  /**
   * 标注目标名称
   * 当elementType为以下值分别对应
   * Type: 无值
   * Property: 属性名
   * Method: 方法名
   * Parameter: 参数名
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

  // 如果是注解合并，则表示当前注解所属的注解
  public readonly ownerAnnotation: RuntimeAnnotation<A>

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
    if (this.elementType == ElementType.PARAMETER) {
      return this.paramType;
    }
    return Reflect.getMetadata('design:type', this.target, this.name);
  }

  static isAnnotationTypeOf = isAnnotationTypeOf

  /**
   * 获取所有指定类型的注解
   * @param type 注解类型
   */
  static getTypedRuntimeAnnotations<C extends IAnnotationClazz>(type: C, match?: (m: RuntimeAnnotation) => boolean) {
    const isMatch = match || (() => true);
    return runtimeAnnotations.filter((m) => isAnnotationTypeOf(m, type) && isMatch(m)) as RuntimeAnnotation<GetTargetAnnotationType<C>>[];
  }

  /**
   * 根据现有注解来获取相同作用于下对应的指定类型的注解
   * @param anno 当前注解
   * @param type 要获取的注解类型
   */
  static getAnnotationsByAnno<C extends IAnnotationClazz>(anno: RuntimeAnnotation, type: C) {
    if (!anno) {
      return [];
    }
    return this.getTypedRuntimeAnnotations(type,(m)=> {
      return m.ctor == anno.ctor && m.name == anno.name && m.methodName == anno.methodName && m.paramIndex == anno.paramIndex;
    });
  }

  /**
   * 获取指定类的所有注解信息
   * @param {Function} clazz 被修饰的类
   */
  static getClassAnnotations<C extends IAnnotationOrClazz>(clazz: Function): RuntimeAnnotation[]
  static getClassAnnotations<C extends IAnnotationOrClazz>(clazz: Function, annotationType: C): RuntimeAnnotation<GetTargetAnnotationType<C>>[]
  static getClassAnnotations<C extends IAnnotationOrClazz>(clazz: Function, annotationType?: C) {
    const isClassAnnotation = (m: RuntimeAnnotation) => isMatchType(m, clazz) && m.elementType == ElementType.TYPE;
    if (arguments.length > 1) {
      return runtimeAnnotations.filter((m) => isClassAnnotation(m) && isAnnotationTypeOf(m, annotationType));
    }
    return runtimeAnnotations.filter(isClassAnnotation);
  }

  /**
   * 获取指定类的指定类型的注解信息
   * @param {Function} clazz 被修饰的类 
   * @param {Function} type 注解类型
   */
  static getClassAnnotation<C extends IAnnotationOrClazz>(clazz: Function, annotationType: C) {
    return this.getClassAnnotations(clazz, annotationType)[0];
  }

  /**
   * 判断当前类是否存在指定类型的注解
   * @param {Function} clazz 被修饰的类 
   * @param {Function} type 注解类型
   */
  static hasClassAnnotation<C extends IAnnotationOrClazz>(clazz: Function, type: C) {
    return !!this.getClassAnnotation(clazz, type);
  }

  static get allAnnotations() {
    return runtimeAnnotations;
  }

  /**
   * 获取指定类型的多个注解信息
   * @param {Function} type 注解类型
   * @param {Function} clazz 被修饰的类 
   */
  static getAnnotations<C extends IAnnotationOrClazz>(annotationType: C | C[], clazz?: Function): RuntimeAnnotation<GetTargetAnnotationType<C>>[] {
    const isScope = arguments.length >= 2 ? (m: RuntimeAnnotation) => isMatchType(m, clazz) : () => true;
    const types = annotationType instanceof Array ? annotationType : [annotationType];
    return runtimeAnnotations.filter((m) => {
      return isScope(m) && !!types.find((t) => isAnnotationTypeOf(m, t));
    });
  }

  /**
   * 获取指定类型的注解信息
   * @param {Function} type 注解类型
   * @param {Function} clazz 被修饰的类 
   */
  static getAnnotation<C extends IAnnotationOrClazz>(annotationType: C, clazz?: Function) {
    if (arguments.length == 1) {
      return this.getAnnotations(annotationType)[0];
    }
    return this.getAnnotations(annotationType, clazz)[0];
  }

  /**
   * 获取指定函数的注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string): RuntimeAnnotation[]
  static getMethodAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, annotationType: C): RuntimeAnnotation<GetTargetAnnotationType<C>>[]
  static getMethodAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, annotationType?: C): RuntimeAnnotation[] {
    const isMethodAnnotation = (m: RuntimeAnnotation) => isMatchType(m, clazz) && m.name == method && m.elementType == ElementType.METHOD;
    if (arguments.length > 2) {
      return runtimeAnnotations.filter((m) => isMethodAnnotation(m) && isAnnotationTypeOf(m, annotationType));
    }
    return runtimeAnnotations.filter(isMethodAnnotation);
  }

  /**
   * 获取指定函数的指定注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   */
  static getMethodAnnotation<C extends IAnnotationOrClazz>(clazz: Function, method: string, annotationType: C) {
    return this.getMethodAnnotations(clazz, method, annotationType)[0];
  }

  /**
   * 获取指定函数的参数注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   */
  static getMethodParamAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string): RuntimeAnnotation[]
  static getMethodParamAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string, annotationType: C): RuntimeAnnotation<GetTargetAnnotationType<C>>[]
  static getMethodParamAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string, annotationType?: C) {
    const isMethodParamAnnotation = (m: RuntimeAnnotation) => isMatchType(m, clazz) && m.name == method && m.elementType == ElementType.PARAMETER && (m.paramName === paramName || paramName === undefined)
    if (arguments.length > 3) {
      return runtimeAnnotations.filter((m) => isMethodParamAnnotation(m) && isAnnotationTypeOf(m, annotationType));
    } else {
      return runtimeAnnotations.filter(isMethodParamAnnotation);
    }
  }

  /**
   * 获取指定函数指定名称参数注解
   * @param clazz 函数所在类 
   * @param method 函数名称
   * @param paramName 参数下标
   */
  static getMethodParamAnnotation<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string, annotationType?: C) {
    return this.getMethodParamAnnotations(clazz, method, paramName, annotationType)[0];
  }

  /**
   * 合并配置值到nativeAnnotation上
   * @param nativeAnnotation 
   * @param initializer 
   */
  private static mergeAnnotationValues(annotation: RuntimeAnnotation<any>, initializer: Record<string, any>) {
    const nativeAnnotation = annotation.nativeAnnotation;
    const aliasAnnotations = RuntimeAnnotation.getAnnotations(AliasFor, nativeAnnotation.constructor);
    const mergeAnnotations = runtimeAnnotations.filter((m) => m.ownerAnnotation == annotation)
    const mappings: Record<string, InstanceType<typeof AliasFor>> = {};
    aliasAnnotations.forEach((m) => {
      mappings[m.name] = m.nativeAnnotation;
    });
    // 自动将配置的值赋值到nativeAnnotation上
    Object.keys(initializer).forEach((key) => {
      const aliasAnno = mappings[key];
      const value = initializer[key];
      nativeAnnotation[key] = value;
      if (aliasAnno) {
        const target = aliasAnno.annotation ? mergeAnnotations.find((m) => isAnnotationTypeOf(m, aliasAnno.annotation))?.nativeAnnotation : nativeAnnotation;
        if (target) {
          const aliasKey = aliasAnno.value || key;
          // 如果有别名,则执行别名赋值
          target[aliasKey] = value;
        }
      }
    });
  }

  constructor(meta: any[], NativeAnnotation: IAnnotationClazz, elementTypes: ElementType[], initializer: any, ownerAnnotation?: RuntimeAnnotation) {
    const [target, name, descritpor,] = meta;

    if (ownerAnnotation && ownerAnnotation instanceof RuntimeAnnotation) {
      this.ownerAnnotation = ownerAnnotation;
    }

    this.meta = meta;
    this.target = target;
    this.elementType = checkAnnotation(elementTypes, meta, NativeAnnotation.name);

    // 初始化元信息
    switch (this.elementType) {
      case ElementType.TYPE:
        break;
      case ElementType.METHOD:
        this.name = name;
        this.methodName = name;
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

    // 根据构造创建注解实例
    this.nativeAnnotation = new NativeAnnotation(this, initializer, meta);

    // 合并注解
    const mergeAnnotations = (NativeAnnotation[mergeAnnotationSymbol] || []) as Function[]
    mergeAnnotations.forEach((decorator) => {
      decorator(...meta, this);
    });

    if (Object.prototype.toString.call(initializer) === '[object Object]') {
      RuntimeAnnotation.mergeAnnotationValues(this, initializer);
    } else if (initializer) {
      RuntimeAnnotation.mergeAnnotationValues(this, { value: initializer });
    }

    // 将注解添加到注解列表
    runtimeAnnotations.push(this);
  }
}

hot
  .create(module)
  .preload((old) => {
    // 当有文件更新时，需要检测那些注解是依赖该文件，如果是则需要移除,因为热更新后会重新注册。
    const file = old.filename;
    const annotations = runtimeAnnotations.filter((m) => !Tracer.isDependency(m.ctor, file));
    runtimeAnnotations.length = 0;
    runtimeAnnotations.push(...annotations);
  });