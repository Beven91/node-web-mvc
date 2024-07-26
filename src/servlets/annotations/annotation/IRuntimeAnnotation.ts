import ElementType from './ElementType';

export default interface IRuntimeAnnotation {

  elementType: ElementType

  nativeAnnotation: any

  method: Function

  name: string

  paramName: string
}
