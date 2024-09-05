/**
 * @module RuntimeAnnotation
 * @description 运行时注解类
 */
import hot from '../../../hmr/src';
import ElementType, { checkAnnotation } from './ElementType';
import Javascript from '../../../interface/Javascript';
import Tracer from './Tracer';
import { mergeAnnotationSymbol } from '../Merge';
import { ClazzType } from '../../../interface/declare';
import AnnotationIndexer from './AnnotationIndexer';
import { IAnnotationClazz, IAnnotationOrClazz, MetaRuntimeTypeInfo } from './type';
import Alias from './Alias';
import IRuntimeAnnotation from './IRuntimeAnnotation';
import { getRuntimeType } from './metadata';

// 所有运行时注解
const runtimeAnnotations: Array<RuntimeAnnotation> = [];

type GetTargetAnnotationType<T> = T extends { NativeAnnotation: abstract new (...args: any) => infer A } ? A : T extends abstract new (...args: any[]) => infer A ? A : T;

const isMatchType = (m: RuntimeAnnotation, clazz: Function) => {
  if (m.ctor === clazz) {
    return true;
  }
  return Javascript.createTyper(clazz).isExtendOf(m.ctor);
};

export default class RuntimeAnnotation<A = any> implements IRuntimeAnnotation {
  private readonly meta: any[];

  /**
   * 标注的类或者函数
   */
  public readonly target: Function;

  /**
   * 标注类的构造函数
   */
  get ctor() {
    switch (this.elementType) {
      case ElementType.TYPE:
        return this.target as ClazzType;
      default:
        return this.target.constructor as ClazzType;
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

  public readonly methodName: string;

  /**
   * 标注目标名称
   * 当elementType为以下值分别对应
   * Type: 无值
   * Property: 属性名
   * Method: 方法名
   * Parameter: 参数名
   */
  public readonly name: string;

  /**
   * 标注参数的下表
   */
  public readonly paramIndex: number;

  /**
   * 参数名称
   */
  public readonly paramName: string;

  /**
   * 如果是标注在属性上，此属性会指向属性的descritpor
   */
  public readonly descriptor: any;

  // 标注实例
  public readonly nativeAnnotation: GetTargetAnnotationType<A>;

  // 当前标注实际使用的类型
  public readonly elementType: ElementType;

  // 如果是注解合并，则表示当前注解所属的注解
  public readonly ownerAnnotation: RuntimeAnnotation<A>;

  public parameters: string[];

  /**
   * 如果当前注解为：函数注解，则能获取到返回结果类型
   */
  get returnType(): MetaRuntimeTypeInfo {
    return getRuntimeType('design:returntype', this.target, this.name);
  }

  /**
   * 如果当前为函数注解，则能获取到当前函数的参数类型
   */
  get paramTypes() {
    const paramTypes = (Reflect.getMetadata('design:paramtypes', this.target, this.name) || []) as [];
    return paramTypes.map((paramType, i)=>{
      return getRuntimeType('design:paramtypes', this.target, this.name, i);
    });
  }

  /**
   * 如果当前注解为参数注解，则能获取到当前参数的类型
   * @param ctor
   */
  get paramType(): MetaRuntimeTypeInfo {
    return getRuntimeType('design:paramtypes', this.target, this.name, this.paramIndex);
  }

  /**
   * 当注解，作用在属性上时，的类型
   */
  get dataType(): MetaRuntimeTypeInfo {
    if (this.elementType == ElementType.PARAMETER) {
      return this.paramType;
    }
    return getRuntimeType('design:type', this.target, this.name);
  }

  /**
   * 获取所有指定类型的注解
   * @param type 注解类型
   */
  static getTypedRuntimeAnnotations<C extends IAnnotationClazz>(type: C, match?: (m: RuntimeAnnotation) => boolean) {
    const isMatch = match || (() => true);
    return runtimeAnnotations.filter((m) => AnnotationIndexer.isAnnotationTypeOf(m, type) && isMatch(m)) as RuntimeAnnotation<C>[];
  }

  /**
  * 获取指定类型的注解
  * @param type 注解类型
  */
  static getTypedRuntimeAnnotation<C extends IAnnotationClazz>(type: C, match?: (m: RuntimeAnnotation) => boolean) {
    const isMatch = match || (() => true);
    return runtimeAnnotations.find((m) => AnnotationIndexer.isAnnotationTypeOf(m, type) && isMatch(m)) as RuntimeAnnotation<C>;
  }

  /**
   * 根据现有注解来获取相同作用于下对应的指定类型的注解
   * @param anno 当前注解
   * @param type 要获取的注解类型
   */
  static getAnnotationsByAnno<C extends IAnnotationClazz>(anno: RuntimeAnnotation, type: C): RuntimeAnnotation<C>[] {
    if (!anno) {
      return [];
    }
    return this.getTypedRuntimeAnnotations(type, (m) => {
      return m.ctor == anno.ctor && m.name == anno.name && m.methodName == anno.methodName && m.paramIndex == anno.paramIndex;
    });
  }

  /**
   * 获取指定类的所有注解信息
   * @param {Function} clazz 被修饰的类
   */
  static getClassAnnotations<C extends IAnnotationOrClazz>(clazz: Function): RuntimeAnnotation[];
  static getClassAnnotations<C extends IAnnotationOrClazz>(clazz: Function, annotationType: C): RuntimeAnnotation<C>[];
  static getClassAnnotations<C extends IAnnotationOrClazz>(clazz: Function, annotationType?: C) {
    const indexcer = AnnotationIndexer.getIndexer(clazz);
    if (!indexcer) return [];
    if (arguments.length == 1) {
      return AnnotationIndexer.findAnnotations(indexcer.clazz);
    }
    return AnnotationIndexer.findAnnotations(indexcer.clazz, annotationType);
  }

  /**
   * 获取指定类的指定类型的注解信息
   * @param {Function} clazz 被修饰的类
   * @param {Function} type 注解类型
   */
  static getClassAnnotation<C extends IAnnotationOrClazz>(clazz: Function, annotationType: C): RuntimeAnnotation<C> {
    return AnnotationIndexer.getClazzAnnotation(clazz, annotationType);
  }

  /**
   * 判断当前类是否存在指定类型的注解
   * @param {Function} clazz 被修饰的类
   * @param {Function} type 注解类型
   */
  static hasClassAnnotation<C extends IAnnotationOrClazz>(clazz: Function, type: C) {
    return !!this.getClassAnnotation(clazz, type);
  }

  /**
   * 获取指定类型的多个注解信息
   * @param {Function} type 注解类型
   * @param {Function} clazz 被修饰的类
   */
  static getAnnotations<C extends IAnnotationOrClazz>(annotationType: C | C[], clazz?: Function): RuntimeAnnotation<C>[] {
    const isScope = arguments.length >= 2 ? (m: RuntimeAnnotation) => isMatchType(m, clazz) : () => true;
    const types = annotationType instanceof Array ? annotationType : [ annotationType ];
    return runtimeAnnotations.filter((m) => {
      return isScope(m) && !!types.find((t) => AnnotationIndexer.isAnnotationTypeOf(m, t));
    });
  }

  /**
   * 获取指定类型的注解信息
   * @param {Function} type 注解类型
   * @param {Function} clazz 被修饰的类
   */
  static getAnnotation<C extends IAnnotationOrClazz>(annotationType: C, clazz?: Function): RuntimeAnnotation<C> {
    // eslint-disable-next-line prefer-rest-params
    return this.getAnnotations.call(this, ...arguments)[0];
  }

  /**
   * 获取指定函数的注解
   * @param clazz 函数所在类
   * @param method 函数名称
   */
  static getMethodAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string | Function): RuntimeAnnotation[];
  static getMethodAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string | Function, annotationType: C): RuntimeAnnotation<C>[];
  static getMethodAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string | Function, annotationType?: C): RuntimeAnnotation[] {
    const methodIndexer = AnnotationIndexer.getMethodIndexer(clazz, method);
    if (!methodIndexer) return [];
    if (arguments.length == 2) {
      return AnnotationIndexer.findAnnotations(methodIndexer.annotations);
    }
    return AnnotationIndexer.findAnnotations(methodIndexer.annotations, annotationType);
  }

  /**
   * 获取指定函数的指定注解
   * @param clazz 函数所在类
   * @param method 函数名称
   */
  static getMethodAnnotation<C extends IAnnotationOrClazz>(clazz: Function, method: string | Function, annotationType: C): RuntimeAnnotation<C> {
    return AnnotationIndexer.getMethodAnnotation(clazz, method, annotationType);
  }

  /**
   * 获取指定函数的参数注解
   * @param clazz 函数所在类
   * @param method 函数名称
   */
  static getMethodParamAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string): RuntimeAnnotation[];
  static getMethodParamAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string, annotationType: C): RuntimeAnnotation<C>[];
  static getMethodParamAnnotations<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string, annotationType?: C) {
    const parameterIndexer = AnnotationIndexer.getMethodIndexer(clazz, method)?.parameters?.[paramName];
    if (!parameterIndexer) return [];
    if (arguments.length == 3) {
      return AnnotationIndexer.findAnnotations(parameterIndexer);
    }
    return AnnotationIndexer.findAnnotations(parameterIndexer, annotationType);
  }

  /**
   * 获取指定函数指定名称参数注解
   * @param clazz 函数所在类
   * @param method 函数名称
   * @param paramName 参数下标
   */
  static getMethodParamAnnotation<C extends IAnnotationOrClazz>(clazz: Function, method: string, paramName: string, annotationType?: C): RuntimeAnnotation<C> {
    return AnnotationIndexer.getParameterAnnotation(clazz, method, paramName, annotationType);
  }

  /**
   * 获取指定类的属性上的注解信息
   * @param clazz 属性所在类
   * @param name 属性名称
   * @param annotationType 要获取的注解类型,如果不指定则返回该属性上的所有注解
   */
  static getPropertyAnnotations<C extends IAnnotationOrClazz>(clazz: Function, name: string, annotationType?: C): RuntimeAnnotation<C>[] {
    const property = AnnotationIndexer.getIndexer(clazz)?.properties?.[name];
    if (!property) return [];
    if (arguments.length == 2) {
      return AnnotationIndexer.findAnnotations(property);
    } else {
      return AnnotationIndexer.findAnnotations(property, annotationType);
    }
  }

  /**
   * 获取指定类的属性上的注解信息
   * @param clazz 属性所在类
   * @param name 属性名称
   * @param annotationType 要获取的注解类型
   */
  static getPropertyAnnotation<C extends IAnnotationOrClazz>(clazz: Function, name: string, annotationType?: C): RuntimeAnnotation<C> {
    return AnnotationIndexer.getPropertyAnnotation(clazz, name, annotationType);
  }

  /**
   * 获取指定类的所有属性名称
   * @param clazz
   * @returns
   */
  static getClazzPropertyKeys(clazz: Function) {
    const indexcer = AnnotationIndexer.getIndexer(clazz);
    if (!indexcer) return [];
    return Object.keys(indexcer.properties);
  }

  /**
   * 合并配置值到nativeAnnotation上
   * @param nativeAnnotation
   * @param initializer
   */
  private static mergeAnnotationValues(annotation: RuntimeAnnotation<any>, initializer: Record<string, any>) {
    const nativeAnnotation = annotation.nativeAnnotation;
    const aliasAnnotations = RuntimeAnnotation.getAnnotations(Alias, nativeAnnotation.constructor);
    const mergeAnnotations = runtimeAnnotations.filter((m) => m.ownerAnnotation == annotation);
    const mappings: Record<string, InstanceType<typeof Alias>> = {};
    aliasAnnotations.forEach((m) => {
      mappings[m.name] = m.nativeAnnotation;
    });
    // 自动将配置的值赋值到nativeAnnotation上
    Object.keys(initializer).forEach((key) => {
      const aliasAnno = mappings[key];
      const value = initializer[key];
      nativeAnnotation[key] = value;
      if (aliasAnno) {
        const target = aliasAnno.annotation ? mergeAnnotations.find((m) => AnnotationIndexer.isAnnotationTypeOf(m, aliasAnno.annotation))?.nativeAnnotation : nativeAnnotation;
        if (target) {
          const aliasKey = aliasAnno.value || key;
          // 如果有别名,则执行别名赋值
          target[aliasKey] = value;
        }
      }
    });
  }

  constructor(meta: any, NativeAnnotation: IAnnotationClazz, elementTypes: ElementType[], initializer: any, ownerAnnotation?: RuntimeAnnotation) {
    const [ target, name, descritpor ] = meta;

    if (ownerAnnotation && ownerAnnotation instanceof RuntimeAnnotation) {
      this.ownerAnnotation = ownerAnnotation;
    }

    this.meta = meta;
    this.target = target;
    this.elementType = checkAnnotation(elementTypes, meta, NativeAnnotation.name);
    const indexer = AnnotationIndexer.createIndexerIfNeed(this.ctor);

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
        this.methodName = name;
        this.paramIndex = descritpor;
        this.paramName = Javascript.resolveParameters(target[name])[this.paramIndex];
        break;
    }

    // 根据构造创建注解实例
    this.nativeAnnotation = new NativeAnnotation(this, initializer, meta);

    // 合并注解
    const mergeAnnotations = (NativeAnnotation[mergeAnnotationSymbol] || []) as Function[];
    mergeAnnotations.forEach((decorator) => {
      decorator(...meta, this);
    });

    if (Object.prototype.toString.call(initializer) === '[object Object]') {
      RuntimeAnnotation.mergeAnnotationValues(this, initializer);
    } else if (initializer) {
      RuntimeAnnotation.mergeAnnotationValues(this, { value: initializer });
    }

    // 添加到索引中
    indexer.addAnnotation(this);
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
