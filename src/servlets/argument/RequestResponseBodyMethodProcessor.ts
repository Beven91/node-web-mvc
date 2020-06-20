/**
 * @module RequestResponseBodyMethodProcessor
 * @description 解析application/json类型的body内容
 */

import ServletContext from '../ServletContext';
import MethodParameter from "../../interface/MethodParameter";
import HandlerMethodArgumentResolver from "./HandlerMethodArgumentResolver";
import MessageConverter from '../converts/MessageConverter';

export default class RequestResponseBodyMethodProcessor implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter) {
    return paramater.paramType === 'body';
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    return MessageConverter.read(servletContext);
  }
}