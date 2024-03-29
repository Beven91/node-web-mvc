import WebMvcConfigurationSupport from '../config/WebMvcConfigurationSupport';
import HttpStatus from '../http/HttpStatus';
import HandlerMethod from './HandlerMethod';

export default class HttpStatusHandlerMethod extends HandlerMethod {

  constructor(status: HttpStatus) {
    super({}, () => undefined);
    this.internalResponseStatus = status.code;
    this.internalResponseStatusReason = status.message;
  }
}