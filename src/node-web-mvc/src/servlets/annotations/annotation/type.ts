export interface IAnnotationClazz {
  new(...args: any[]): any
}

export type LinkAnnotationType<A> = { NativeAnnotation: A };

export interface IAnnotation extends Function, LinkAnnotationType<any> {
}

export type IAnnotationOrClazz = IAnnotationClazz | IAnnotation;
