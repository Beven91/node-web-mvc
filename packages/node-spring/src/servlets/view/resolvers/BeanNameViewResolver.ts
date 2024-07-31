import { BeanFactory } from '../../../ioc/factory/BeanFactory';
import HttpServletRequest from '../../http/HttpServletRequest';
import View from '../View';
import ViewResolver from './ViewResolver';


export default class BeanNameViewResolver implements ViewResolver {
  private readonly beanFactory: BeanFactory;

  constructor(beanFactory: BeanFactory) {
    this.beanFactory = beanFactory;
  }

  resolveViewName(viewName: string, model: any, request: HttpServletRequest): View {
    const beanFactory = this.beanFactory;
    if (!beanFactory.isTypeMatch(viewName, View)) {
      return null;
    }
    return beanFactory.getBean<View>(viewName);
  }
}
