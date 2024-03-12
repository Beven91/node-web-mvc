import RuntimeAnnotation, { IAnnotationClazz, LinkAnnotationType } from "./annotation/RuntimeAnnotation";
import ElementType, { } from "./annotation/ElementType";

type ValuePropertyType<A> = A extends { value?: infer V } ? V : never

type TargetObject = { [x: string]: any }


// Class Decorator
declare function ClassTargetDecorator<A>(target: Function): any
declare function ClassTargetDecorator<A>(options: A): ClassDecorator
declare type ConfigableClassDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Method Decorator
declare function MethodTargetDecorator<A>(options: A): MethodDecorator
declare function MethodTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare type ConfigableMethodDecorator = <A extends IAnnotationClazz>(target: A) => typeof MethodTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Property Decorator 
declare function PropertyTargetDecorator<A>(options: A): (target: Object, propertyKey: string, p: void) => any
declare function PropertyTargetDecorator<A>(target: TargetObject, propertyKey: string, p: void): any
declare type ConfigablePropertyDecorator = <A extends IAnnotationClazz>(target: A) => typeof PropertyTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A>  & A

// Parameter Decorator
declare function ParameterTargetDecorator<A>(options: A): ParameterDecorator
declare function ParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigableParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof ParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A>  & A

// Class Or Method Decorator
declare function ClassMethodTargetDecoratorReturn(target: Function): any
declare function ClassMethodTargetDecoratorReturn(target: Object, name: string, descriptor: TypedPropertyDescriptor<any>): any
declare function ClassMethodTargetDecorator<A>(options: A): typeof ClassMethodTargetDecoratorReturn
declare function ClassMethodTargetDecorator<A>(target: Function): Function | void
declare function ClassMethodTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare type ConfigableClassMethodDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassMethodTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Class Or Method Or Property Decorator
declare function ClassMethodPropertyTargetDecorator<A>(options: A): (target: any, name?: string) => any
declare function ClassMethodPropertyTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare function ClassMethodPropertyTargetDecorator<A>(target: TargetObject, propertyKey: string): any
declare function ClassMethodPropertyTargetDecorator<A>(target: Function): any
declare type ConfigableClassMethodPropertyDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassMethodPropertyTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Class Or Method Or Parameter Decorator
declare function ClassMethodParameterTargetDecoratorReturn(target: Function): any
declare function ClassMethodParameterTargetDecoratorReturn(target: Object, name: string, descriptor: TypedPropertyDescriptor<any>): any
declare function ClassMethodParameterTargetDecoratorReturn(target: Object, name: string, parameterIndex: number): any
declare function ClassMethodParameterTargetDecorator<A>(options: A): typeof ClassMethodParameterTargetDecoratorReturn
declare function ClassMethodParameterTargetDecorator<A>(target: Function): any
declare function ClassMethodParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare function ClassMethodParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigableClassMethodParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassMethodParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Class Or Property Decorator
declare function ClassPropertyTargetDecorator<A>(options: A): (target: Function | Object, name?: string, p?: void) => any
declare function ClassPropertyTargetDecorator<A>(target: Function): any
declare function ClassPropertyTargetDecorator<A>(target: TargetObject, propertyKey: string, p?: void): void
declare type ConfigableClassPropertyDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassPropertyTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Class Or Property Or Parameter Decorator
declare function ClassPropertyParameterTargetDecorator<A>(options: A): (target: Function | Object, name?: string, p?: number) => any
declare function ClassPropertyParameterTargetDecorator<A>(target: Function): any
declare function ClassPropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, p?: void): void
declare function ClassPropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigableClassPropertyParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassPropertyParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Class Or Parameter Decorator
declare function ClassParameterTargetDecoratorReturn(target: Function): any
declare function ClassParameterTargetDecoratorReturn(target: Object, propertyKey: string, parameterIndex: number): void
declare function ClassParameterTargetDecorator<A>(options: A): typeof ClassParameterTargetDecoratorReturn
declare function ClassParameterTargetDecorator<A>(target: Function): any
declare function ClassParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): void
declare type ConfigableClassParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof ClassParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// All Decorator
declare function AllTargetDecorator<A>(options: A): (target: any, name?: string, p?: number | TypedPropertyDescriptor<any>) => any
declare function AllTargetDecorator<A>(target: Function): any
declare function AllTargetDecorator<A>(target: TargetObject, propertyKey: string): any
declare function AllTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare function AllTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigableAllDecorator = <A extends IAnnotationClazz>(target: A) => typeof AllTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Method Or Property Decorator
declare function MethodPropertyTargetDecorator<A>(options: A): (target: Object, name: string, p?: TypedPropertyDescriptor<any>) => any
declare function MethodPropertyTargetDecorator<A>(target: TargetObject, propertyKey: string): any
declare function MethodPropertyTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare type ConfigableMethodPropertyDecorator = <A extends IAnnotationClazz>(target: A) => typeof MethodPropertyTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A


// Method Or Property Or Parameter Decorator
declare function MethodPropertyParameterTargetDecorator<A>(options: A): (target: Object, name: string, p?: number | TypedPropertyDescriptor<any>) => any
declare function MethodPropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string): any
declare function MethodPropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare function MethodPropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigableMethodPropertyParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof MethodPropertyParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Method Or Parameter Decorator
declare function MethodParameterTargetDecorator<A>(options: A): (target: Object, name: string, p: TypedPropertyDescriptor<any> | number) => any
declare function MethodParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
declare function MethodParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigableMethodParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof MethodParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

// Property Or Parameter Decorator
declare function PropertyParameterTargetDecorator<A>(options: A): (target: Object, name: string, p?: number) => any
declare function PropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string): any
declare function PropertyParameterTargetDecorator<A>(target: TargetObject, propertyKey: string, parameterIndex: number): any
declare type ConfigablePropertyParameterDecorator = <A extends IAnnotationClazz>(target: A) => typeof PropertyParameterTargetDecorator<InstanceType<A> | ValuePropertyType<InstanceType<A>>> & LinkAnnotationType<A> & A

type PushFront<TailT extends any[], HeadT> =
  ((head: HeadT, ...tail: TailT) => void) extends ((...arr: infer ArrT) => void) ? ArrT : never;

type UnorderTuple<U extends string, ResultT extends any[] = []> = {
  [k in U]: (
    [Exclude<U, k>] extends [never] ?
    PushFront<ResultT, k> :
    UnorderTuple<Exclude<U, k>, PushFront<ResultT, k>>
  )
}[U];

function Target(elementType: ElementType.TYPE | [ElementType.TYPE]): ConfigableClassDecorator

function Target(elementType: ElementType.METHOD | [ElementType.METHOD]): ConfigableMethodDecorator

function Target(elementType: ElementType.PARAMETER | [ElementType.PARAMETER]): ConfigableParameterDecorator

function Target(elementType: ElementType.PROPERTY | [ElementType.PROPERTY]): ConfigablePropertyDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.METHOD>): ConfigableClassMethodDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.METHOD | ElementType.PARAMETER>): ConfigableClassMethodParameterDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.METHOD | ElementType.PROPERTY>): ConfigableClassMethodPropertyDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.METHOD | ElementType.PROPERTY | ElementType.PARAMETER>): ConfigableAllDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.PROPERTY>): ConfigableClassPropertyDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.PROPERTY | ElementType.PARAMETER>): ConfigableClassPropertyParameterDecorator

function Target(elementTypes: UnorderTuple<ElementType.TYPE | ElementType.PARAMETER>): ConfigableClassParameterDecorator

function Target(elementTypes: UnorderTuple<ElementType.METHOD | ElementType.PROPERTY>): ConfigableMethodPropertyDecorator

function Target(elementTypes: UnorderTuple<ElementType.METHOD | ElementType.PROPERTY | ElementType.PARAMETER>): ConfigableMethodPropertyParameterDecorator

function Target(elementTypes: UnorderTuple<ElementType.METHOD | ElementType.PARAMETER>): ConfigableMethodParameterDecorator

function Target(elementTypes: UnorderTuple<ElementType.PROPERTY | ElementType.PARAMETER>): ConfigablePropertyParameterDecorator

function Target(types: ElementType | ElementType[]) {
  return function TargetAnnotation(annotationType: IAnnotationClazz) {
    return RuntimeAnnotation.create(types, annotationType)
  }
}

export default Target;