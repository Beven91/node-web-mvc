import MethodParameter from "../MethodParameter";
import ServletContext from "../../http/ServletContext";
import ResponseBody from "../../annotations/ResponseBody";
import HttpStatus from "../../http/HttpStatus";
import RequestBody from "../../annotations/params/RequestBody";
import AbstractMessageConverterMethodProcessor from "./AbstractMessageConverterMethodProcessor";

export default class RequestResponseBodyMethodProcessor extends AbstractMessageConverterMethodProcessor {

  supportsReturnType(returnType: MethodParameter): boolean {
    return returnType.hasClassAnnotation(ResponseBody) || returnType.hasMethodAnnotation(ResponseBody);
  }

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestBody)
  }

  async resolveArgument(parameter: MethodParameter, servletContext: ServletContext) {
    return this.readWithMessageConverters(servletContext, parameter.parameterType);
  }

  private hasValue(returnValue: any) {
    return (returnValue !== null) && returnValue !== '' && returnValue !== undefined;
  }

  async handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext): Promise<void> {
    const response = servletContext.response;
    if (this.hasValue(returnValue)) {
      response.setStatus(HttpStatus.OK);
      // 设置Http返回状态码
      await this.writeWithMessageConverters(returnValue, servletContext);
    } else {
      response.setStatus(HttpStatus.OK);

    }
    if (!servletContext.isRequestHandled) {
      // 结束返回流
      response.end()
    }
  }
}