
export type MergeDecorator = ClassDecorator | ParameterDecorator | MethodDecorator | PropertyDecorator;

export const mergeAnnotationSymbol = Symbol('MergeAnnotations');

/**
 * 用于标注合并注解，
 * @param decorators 请注意，您需要保证传入的注解需要和目标注解的elementType一致
 */
export default function Merge(...decorators: MergeDecorator[]) {
  return function MergeAnnotation(target: Function) {
    target[mergeAnnotationSymbol] = decorators;
  };
}
