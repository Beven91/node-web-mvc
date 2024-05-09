import ServletContext from "../../http/ServletContext";
import MethodParameter from "../MethodParameter";
import HandlerMethodArgumentResolver from "../argument/HandlerMethodArgumentResolver";
import HandlerMethodReturnValueHandler from "../return/HandlerMethodReturnValueHandler";
import ModelAttribute from "../../annotations/ModelAttribute";
import { getVariableName, isSimpleValueType } from "../../util/ApiUtils";
import ModelAndViewContainer from "../../models/ModelAndViewContainer";

export default class ModelAttributeMethodProcessor implements HandlerMethodArgumentResolver, HandlerMethodReturnValueHandler {

  private isAnnotationRequired = true;

  constructor(isAnnotationRequired = true) {
    this.isAnnotationRequired = isAnnotationRequired;
  }

  private getNameForReturnValue(returnType: MethodParameter) {
    const anno = returnType.getParameterAnnotation(ModelAttribute);
    if (anno) {
      return anno.value;
    }
    return getVariableName(returnType.parameterType);
  }

  supportsParameter(parameter: MethodParameter): boolean {
    if (this.isAnnotationRequired) {
      return parameter.hasParameterAnnotation(ModelAttribute);
    }
    return !isSimpleValueType(parameter.parameterType);
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    // 这里不实现WebDataBinder直接从query中提取
    const name = this.getNameForReturnValue(parameter);
    const query = servletContext.request.query;
    return query[name];
  }

  supportsReturnType(returnType: MethodParameter): boolean {
    if (this.isAnnotationRequired) {
      return returnType.hasParameterAnnotation(ModelAttribute);
    }
    return !isSimpleValueType(returnType.parameterType);
  }

  async handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, mavContainer: ModelAndViewContainer): Promise<void> {
    if (returnValue) {
      const name = this.getNameForReturnValue(returnType);
      mavContainer.addAttribute(name, returnValue);
    }
  }
}