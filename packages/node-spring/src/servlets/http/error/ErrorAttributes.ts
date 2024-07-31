import type ServletContext from '../ServletContext';

export default abstract class ErrorAttributes {
  abstract getErrorAttributes(servletContext: ServletContext): Record<string, string>;
}
