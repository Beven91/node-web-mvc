/**
 * 注解索引，用于快速获取指定类下相关注解
 */

import ElementType from './ElementType';
import RuntimeAnnotation, { IAnnotation, IAnnotationClazz } from './RuntimeAnnotation';
import { IAnnotationOrClazz } from "./RuntimeAnnotation";

const annotationsSymbol = Symbol('annotations');
const mapAnnotationsSymbol = Symbol('allAnnotations');

interface MethodIndexer {
  annotations: Map<Function, RuntimeAnnotation[]>
  parameters: {
    [x: string]: Map<Function, RuntimeAnnotation[]>
  }
}

export default class AnnotationIndexer {

  clazz: Map<Function, RuntimeAnnotation[]>

  properties: {
    [x: string]: Map<Function, RuntimeAnnotation[]>
  }

  methods: Map<Function, MethodIndexer>

  static createIndexerIfNeed(ctor: Function) {
    if (!ctor[annotationsSymbol]) {
      ctor[annotationsSymbol] = new AnnotationIndexer();
    }
    return ctor[annotationsSymbol] as AnnotationIndexer;
  }

  static getIndexer(ctor: Function) {
    if (!ctor) {
      return null;
    }
    return ctor[annotationsSymbol] as AnnotationIndexer;
  }

  static getMethodIndexer(clazz: Function, method: string | Function) {
    const indexer = this.getIndexer(clazz);
    const key = typeof method == 'string' ? clazz.prototype?.[method] as Function : method;
    return indexer?.methods?.get?.(key);
  }

  constructor() {
    this.clazz = new Map<Function, RuntimeAnnotation[]>();
    this.properties = {};
    this.methods = new Map<Function, MethodIndexer>();
  }

  private createMethodIndexer(methodKey: Function) {
    let method = this.methods.get(methodKey)
    if (!method) {
      method = {
        annotations: new Map<Function, RuntimeAnnotation[]>(),
        parameters: {}
      }
      this.methods.set(methodKey, method);
    }
    return method;
  }

  private cacheAnnotation(map: Map<Function, RuntimeAnnotation[]>, key: Function, annotation: RuntimeAnnotation) {
    let annotations = map.get(key);
    let allAnnotations = map[mapAnnotationsSymbol];
    if (!annotations) {
      annotations = [];
      map.set(key, annotations);
    }
    if (!allAnnotations) {
      allAnnotations = map[mapAnnotationsSymbol] = [];
    }
    allAnnotations.push(annotation);
    annotations.push(annotation);
  }

  addAnnotation(annotation: RuntimeAnnotation) {
    const cacheKey = annotation.nativeAnnotation.constructor;
    switch (annotation.elementType) {
      case ElementType.TYPE:
        this.cacheAnnotation(this.clazz, cacheKey, annotation);
        break;
      case ElementType.METHOD:
        this.cacheAnnotation(this.createMethodIndexer(annotation.method).annotations, cacheKey, annotation);
        break;
      case ElementType.PROPERTY:
        {
          const name = annotation.name;
          let properties = this.properties[name];
          if (!properties) {
            properties = this.properties[name] = new Map<Function, RuntimeAnnotation[]>();
          }
          this.cacheAnnotation(properties, cacheKey, annotation);
        }
      case ElementType.PARAMETER:
        {
          const paramName = annotation.paramName;
          const method = this.createMethodIndexer(annotation.method);
          let parameter = method.parameters[paramName];
          if (!parameter) {
            parameter = method.parameters[paramName] = new Map<Function, RuntimeAnnotation[]>();
          }
          this.cacheAnnotation(parameter, cacheKey, annotation);
        }
    }
  }

  static getClazzAnnotation(clazz: Function, annotationType: IAnnotationOrClazz) {
    const indexer = this.getIndexer(clazz);
    if (indexer) {
      return indexer.clazz.get(annotationType)?.[0] || this.findAnnotation(indexer.clazz, annotationType);
    }
  }

  static getMethodAnnotation(clazz: Function, methodKey: string | Function, annotationType: IAnnotationOrClazz) {
    const indexer = this.getMethodIndexer(clazz, methodKey);
    if (indexer) {
      return indexer.annotations.get(annotationType)?.[0] || this.findAnnotation(indexer.annotations, annotationType);
    }
  }

  static getPropertyAnnotation(clazz: Function, name: string, annotationType: IAnnotationOrClazz) {
    const indexer = this.getIndexer(clazz);
    const property = indexer?.properties?.[name];
    if (property) {
      return property.get(annotationType)?.[0] || this.findAnnotation(property, annotationType);
    }
  }

  static getParameterAnnotation(clazz: Function, methodKey: string | Function, paramName: string, annotationType: IAnnotationOrClazz) {
    const parameter = this.getMethodIndexer(clazz, methodKey)?.parameters?.[paramName];
    if (!parameter) {
      return parameter.get(annotationType)?.[0] || this.findAnnotation(parameter, annotationType);
    };
  }

  static findAnnotation(info: Map<Function, RuntimeAnnotation[]>, annotationType?: IAnnotationOrClazz) {
    const annotations = info[mapAnnotationsSymbol];
    const len = arguments.length;
    if (!annotations) {
      return null;
    }
    if (len == 1) {
      return annotations[0];
    } else {
      return annotations.find((m) => this.isAnnotationTypeOf(m, annotationType))
    }
  }

  static findAnnotations(info: Map<Function, RuntimeAnnotation[]>, annotationType?: IAnnotationOrClazz) {
    const annotations = info[mapAnnotationsSymbol];
    const len = arguments.length;
    if (!annotations) {
      return null;
    }
    if (len == 1) {
      return annotations;
    } else {
      return annotations.filter((m) => this.isAnnotationTypeOf(m, annotationType))
    }
  }

  static isAnnotationTypeOf(m: RuntimeAnnotation, type: IAnnotation | IAnnotationClazz) {
    const nativeAnnotation = m.nativeAnnotation;
    const NativeAnnotation = (type as IAnnotation).NativeAnnotation;
    return nativeAnnotation instanceof type || (NativeAnnotation && nativeAnnotation instanceof NativeAnnotation);
  };
}