import MethodParameter from '../MethodParameter';
import ServletContext from '../../http/ServletContext';
import HandlerMethodReturnValueHandler from './HandlerMethodReturnValueHandler';
import UnsupportReturnValueHandlerError from '../../../errors/UnsupportReturnValueHandlerError';
import ModelAndViewContainer from '../../models/ModelAndViewContainer';

export default class HandlerMethodReturnValueHandlerComposite {
  private readonly returnvalueHandlers: HandlerMethodReturnValueHandler[];

  constructor(handlers: HandlerMethodReturnValueHandler[]) {
    this.returnvalueHandlers = handlers || [];
  }

  handleReturnValue(returnValue: any, returnType: MethodParameter, servletContext: ServletContext, mavContainer: ModelAndViewContainer) {
    const handler = this.returnvalueHandlers.find((m) => m.supportsReturnType(returnType));
    if (!handler) {
      const path = servletContext.request.path;
      throw new UnsupportReturnValueHandlerError(`Unknow return value type:${returnType.parameterType} @${path}`, returnValue);
    }
    return handler.handleReturnValue(returnValue, returnType, servletContext, mavContainer);
  }
}
