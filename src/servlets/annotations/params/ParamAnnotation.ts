import MethodParameter, { MethodParameterOptions } from "../../../interface/MethodParameter";

export default class ParamAnnotation extends MethodParameterOptions {
  public param?: MethodParameter

  public value?: string
}