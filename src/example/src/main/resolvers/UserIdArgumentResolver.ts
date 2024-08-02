import { ServletContext, MethodParameter, HandlerMethodArgumentResolver } from 'node-web-mvc';
import UserId from '../annotations/UserId';

export default class UserIdArgumentResolver implements HandlerMethodArgumentResolver {
  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(UserId);
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const cookies = servletContext.request.cookies;
    const token = cookies.token;
    // 从token中解析出用户id
    return token;
  }
}
