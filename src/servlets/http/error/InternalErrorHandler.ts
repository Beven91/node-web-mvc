import Javascript from "../../../interface/Javascript";
import Component from "../../../ioc/annotations/Component";
import { BeanFactory } from "../../../ioc/factory/BeanFactory";
import RuntimeAnnotation from "../../annotations/annotation/RuntimeAnnotation";
import ServletContext from "../../http/ServletContext";
import ModelAndView from "../../models/ModelAndView";
import ViewRender from "../../view/ViewRender";
import ViewResolverRegistry from "../../view/ViewResolverRegistry";
import MediaType from "../MediaType";
import DefaultErrorAttributes from "./DefaultErrorAttributes";
import ErrorAttributes from "./ErrorAttributes";

export default class InternalErrorHandler {

  private readonly errorAttributes: ErrorAttributes

  private readonly registry: ViewResolverRegistry

  constructor(beanFactory: BeanFactory, registry: ViewResolverRegistry) {
    this.registry = registry;
    const isExtendErrorAttributes = (m: RuntimeAnnotation) => Javascript.getClass(m.ctor).isEqualOrExtendOf(ErrorAttributes);
    const MyErrorAttributes = RuntimeAnnotation.getAnnotations(Component).find(isExtendErrorAttributes)?.ctor;
    if (MyErrorAttributes) {
      this.errorAttributes = beanFactory.getBean(MyErrorAttributes);
    } else {
      this.errorAttributes = new DefaultErrorAttributes();
    }
  }

  async tryResolveException(servletContext: ServletContext): Promise<any> {
    if (!servletContext.response.hasError || servletContext.isRequestHandled) {
      // 如果不需要处理异常
      return;
    }
    const accept = servletContext.request.getHeaderValue('accept').join(',')
    const acceptHtml = accept.toLowerCase().indexOf("text/html") > -1;
    return acceptHtml ? this.handleErrorHtml(servletContext) : this.handleError(servletContext);
  }

  handleError(servletContext: ServletContext) {
    const response = servletContext.response;
    const data = this.errorAttributes.getErrorAttributes(servletContext);
    response.fullResponse(JSON.stringify(data), MediaType.APPLICATION_JSON);
  }

  handleErrorHtml(servletContext: ServletContext) {
    const data = this.errorAttributes.getErrorAttributes(servletContext);
    const mv = new ModelAndView("error", data);
    const render = new ViewRender(this.registry);
    return render.render(mv, servletContext);
  }
}