import ValueConvertError from '../../../errors/ValueConvertError';
import ArgumentResolvError from '../../../errors/ArgumentResolvError';
import HttpStatusError from '../../../errors/HttpStatusError';
import ParameterRequiredError from '../../../errors/ParameterRequiredError';
import HttpStatus from '../../http/HttpStatus';
import ServletContext from '../../http/ServletContext';
import HandlerMethod from '../HandlerMethod';
import HandlerExceptionResolver from './HandlerExceptionResolver';
import ModelAndView from '../../models/ModelAndView';
import NoHandlerFoundException from '../../../errors/NoHandlerFoundException';

export default class DefaultHandlerExceptionResolver implements HandlerExceptionResolver {
  isType(error: Error, ...errorTypes: any[]) {
    return errorTypes.find((errorType) => errorType && error instanceof errorType);
  }

  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<ModelAndView> {
    if (this.isType(error, ArgumentResolvError, ValueConvertError, ParameterRequiredError)) {
      servletContext.response.sendError(HttpStatus.BAD_REQUEST);
      return new ModelAndView();
    } else if (error instanceof HttpStatusError) {
      servletContext.response.sendError(error.status);
      return new ModelAndView();
    } else if (error instanceof NoHandlerFoundException) {
      servletContext.response.sendError(HttpStatus.NOT_FOUND);
    } else {
      servletContext.response.sendError(HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return null;
  }
}
