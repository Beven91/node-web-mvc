import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HandlerMethod from './HandlerMethod';

export default class HttpStatusHandlerMethod extends HandlerMethod {

  constructor(status: number, configurer: WebMvcConfigurationSupport) {
    super({}, () => undefined, configurer);
    this.internalResponseStatus = status;
  }
}