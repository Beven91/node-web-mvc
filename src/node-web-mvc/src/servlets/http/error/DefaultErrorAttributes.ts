import type ServletContext from '../ServletContext';
import ErrorAttributes from './ErrorAttributes';


export default class DefaultErrorAttributes extends ErrorAttributes {
  getErrorAttributes(servletContext: ServletContext): Record<string, any> {
    const status = servletContext.response.status;

    return {
      code: status.code,
      message: status.message,
      timestamp: Date.now(),
      path: servletContext.request.path,
    };
  }
}
