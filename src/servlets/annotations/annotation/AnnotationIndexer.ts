/**
 * 注解索引，用于快速获取指定类下相关注解
 */

import Javascript from '../../../interface/Javascript';
import ElementType from './ElementType';
import IRuntimeAnnotation from './IRuntimeAnnotation';
import { IAnnotation, IAnnotationClazz, IAnnotationOrClazz } from './type';

const annotationsSymbol = Symbol('annotations');
const mapAnnotationsSymbol = Symbol('allAnnotations');

interface MethodIndexer {
  annotations: Map<Function, IRuntimeAnnotation[]>
  parameters: {
    [x: string]: Map<Function, IRuntimeAnnotation[]>
  }
}

export default class AnnotationIndexer {
  clazz: Map<Function, IRuntimeAnnotation[]>;

  owner?: Function;

  properties: {
    [x: string]: Map<Function, IRuntimeAnnotation[]>
  };

  methods: Map<Function, MethodIndexer>;

  static createIndexerIfNeed(ctor: Function) {
    if (!this.getIndexer(ctor)) {
      const indexer = new AnnotationIndexer();
      Javascript.defineHiddenProperty(ctor, annotationsSymbol, indexer);
      indexer.owner = ctor;
    }
    return ctor[annotationsSymbol] as AnnotationIndexer;
  }

  static getIndexer(ctor: Function) {
    if (!ctor || !ctor.hasOwnProperty(annotationsSymbol)) {
      return null;
    }
    // 这里为了防止从原型链上找annotationsSymbol 所以采用hasOwnProperty
    return ctor[annotationsSymbol] as AnnotationIndexer;
  }

  static getMethodIndexer(clazz: Function, method: string | Function) {
    const indexer = this.getIndexer(clazz);
    const key = typeof method == 'string' ? clazz.prototype?.[method] as Function : method;
    return indexer?.methods?.get?.(key);
  }

  constructor() {
    this.clazz = new Map<Function, IRuntimeAnnotation[]>();
    this.properties = {};
    this.methods = new Map<Function, MethodIndexer>();
  }

  private createMethodIndexer(methodKey: Function) {
    let method = this.methods.get(methodKey);
    if (!method) {
      method = {
        annotations: new Map<Function, IRuntimeAnnotation[]>(),
        parameters: {},
      };
      this.methods.set(methodKey, method);
    }
    return method;
  }

  private cacheAnnotation(map: Map<Function, IRuntimeAnnotation[]>, key: Function, annotation: IRuntimeAnnotation) {
    let annotations = map.get(key);
    let allAnnotations = map[mapAnnotationsSymbol];
    if (!annotations) {
      annotations = [];
      map.set(key, annotations);
    }
    if (!allAnnotations) {
      allAnnotations = [];
      Javascript.defineHiddenProperty(map, mapAnnotationsSymbol, allAnnotations);
    }
    allAnnotations.push(annotation);
    annotations.push(annotation);
  }

  addAnnotation(annotation: IRuntimeAnnotation) {
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
            properties = this.properties[name] = new Map<Function, IRuntimeAnnotation[]>();
          }
          this.cacheAnnotation(properties, cacheKey, annotation);
        }
      case ElementType.PARAMETER:
        {
          const paramName = annotation.paramName;
          const method = this.createMethodIndexer(annotation.method);
          let parameter = method.parameters[paramName];
          if (!parameter) {
            parameter = method.parameters[paramName] = new Map<Function, IRuntimeAnnotation[]>();
          }
          this.cacheAnnotation(parameter, cacheKey, annotation);
        }
    }
  }

  static getClazzAnnotation(clazz: Function, annotationType: IAnnotationOrClazz) {
    const indexer = this.getIndexer(clazz);
    if (indexer) {
      return this.findAnnotation(indexer.clazz, annotationType);
    }
  }

  static getMethodAnnotation(clazz: Function, methodKey: string | Function, annotationType: IAnnotationOrClazz) {
    const indexer = this.getMethodIndexer(clazz, methodKey);
    if (indexer) {
      return this.findAnnotation(indexer.annotations, annotationType);
    }
  }

  static getPropertyAnnotation(clazz: Function, name: string, annotationType: IAnnotationOrClazz) {
    const indexer = this.getIndexer(clazz);
    const property = indexer?.properties?.[name];
    if (property) {
      return this.findAnnotation(property, annotationType);
    }
  }

  static getParameterAnnotation(clazz: Function, methodKey: string | Function, paramName: string, annotationType: IAnnotationOrClazz) {
    const parameter = this.getMethodIndexer(clazz, methodKey)?.parameters?.[paramName];
    if (parameter) {
      return this.findAnnotation(parameter, annotationType);
    };
  }

  static findAnnotation(info: Map<Function, IRuntimeAnnotation[]>, annotationType?: IAnnotationOrClazz) {
    const annotations = info[mapAnnotationsSymbol];
    const len = arguments.length;
    const cacheKey = (annotationType as IAnnotation)?.NativeAnnotation || annotationType;
    if (!annotations) {
      return null;
    }
    if (len == 1) {
      return annotations[0];
    } else if (info.get(cacheKey)) {
      return info.get(cacheKey)[0];
    } else {
      return annotations.find((m) => this.isAnnotationTypeOf(m, annotationType));
    }
  }

  static findAnnotations(info: Map<Function, IRuntimeAnnotation[]>, annotationType?: IAnnotationOrClazz) {
    const annotations = info[mapAnnotationsSymbol];
    const len = arguments.length;
    if (!annotations) {
      return null;
    }
    if (len == 1) {
      return annotations;
    } else {
      return annotations.filter((m) => this.isAnnotationTypeOf(m, annotationType));
    }
  }

  static isAnnotationTypeOf(m: IRuntimeAnnotation, type: IAnnotation | IAnnotationClazz) {
    const nativeAnnotation = m.nativeAnnotation;
    const NativeAnnotation = (type as IAnnotation).NativeAnnotation;
    return nativeAnnotation instanceof type || (NativeAnnotation && nativeAnnotation instanceof NativeAnnotation);
  };
}
