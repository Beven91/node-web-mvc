import { ClazzType } from '../../../interface/declare';

export interface IAnnotationClazz {
  new(...args: any[]): any
}

export type LinkAnnotationType<A> = { NativeAnnotation: A };

export interface IAnnotation extends Function, LinkAnnotationType<any> {
}

export type IAnnotationOrClazz = IAnnotationClazz | IAnnotation;

export interface MetaRuntimeTypeInfo {
  // 运行时类型 为null则表示无运行时类型
  clazz: ClazzType;
  // 类型名称
  name: string;
  // 是否为数组类型
  array: boolean;
  // 是否为枚举
  enum?: boolean;
  // 类型完整名称，例如: A 或者 A<B,C> 或者 A[]
  fullName: string;
  // 当前是否为泛型参数
  tp?: boolean;
  // 当前参数属于泛型参数名
  at?: string
  // 如果当前类型是泛型类型，则会存在
  args?: MetaRuntimeTypeInfo[];
}
