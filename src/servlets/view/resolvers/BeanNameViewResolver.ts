import HttpServletRequest from "../../http/HttpServletRequest";
import View from "../View";
import ViewResolver from "./ViewResolver";


export default class BeanNameViewResolver implements ViewResolver {
  resolveViewName(viewName: string, model: any, request: HttpServletRequest): View {
    const beanFactory = request.servletContext.configurer.beanFactory;
    if (!beanFactory.isTypeMatch(viewName, View)) {
      return null;
    }
    return beanFactory.getBean<View>(viewName);
  }
}