import ServletContext from '../../http/ServletContext';
import ModelAndView from '../../models/ModelAndView';
import HandlerMethod from '../HandlerMethod';
import HandlerExceptionResolver from './HandlerExceptionResolver';

export default class HandlerExceptionResolverComposite implements HandlerExceptionResolver {
  private exceptionResolvers: HandlerExceptionResolver[];

  setExeceptionResolvers(exceptionResolvers: HandlerExceptionResolver[]) {
    this.exceptionResolvers = exceptionResolvers;
  }

  getExceptionResolvers() {
    return this.exceptionResolvers || [];
  }

  async resolveException(servletContext: ServletContext, handler: HandlerMethod, error: Error): Promise<ModelAndView> {
    for (const resolver of this.getExceptionResolvers()) {
      const mv = await resolver.resolveException(servletContext, handler, error);
      if (mv) {
        return mv;
      }
    }
  }
}
