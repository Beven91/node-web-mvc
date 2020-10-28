import { ServletContext,MethodParameter, HandlerMethodArgumentResolver } from '../../../src/index';
import UserIdAnnotation from '../annotations/UserIdAnnotation';

export default class UserIdArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(UserIdAnnotation)
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const cookies = servletContext.request.cookies;
    const token = cookies.token;
    // 从token中解析出用户id
    return token;
  }
}