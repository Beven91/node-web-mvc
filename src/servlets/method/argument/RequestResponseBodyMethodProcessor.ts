/**
 * @module RequestResponseBodyMethodProcessor
 * @description 解析body正文application/json类型的参数
 */
import ServletContext from '../../http/ServletContext';
import MethodParameter from "../../../interface/MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import MessageConverter from '../..//http/converts/MessageConverter';
import RequestBody from '../../annotations/params/RequestBody';

export default class RequestResponseBodyMethodProcessor implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(RequestBody)
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    return MessageConverter.read(servletContext);
  }
}