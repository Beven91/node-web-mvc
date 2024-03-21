import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HttpStatus from '../http/HttpStatus';
import HandlerMethod from './HandlerMethod';

export default class HttpStatusHandlerMethod extends HandlerMethod {

  constructor(status: HttpStatus, configurer: WebMvcConfigurationSupport) {
    super({}, () => undefined, configurer);
    this.internalResponseStatus = status.code;
    this.internalResponseStatusReason = status.message;
  }
}