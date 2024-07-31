import HttpStatus from '../http/HttpStatus';
import HandlerMethod from './HandlerMethod';

export default class HttpStatusHandlerMethod extends HandlerMethod {
  constructor(status: HttpStatus) {
    super({}, () => undefined);
    this.responseStatus = status.code;
    this.responseStatusReason = status.message;
  }
}
