import HandlerMethod from './HandlerMethod';

export default class HttpStatusHandlerMethod extends HandlerMethod {

  constructor(status) {
    super({}, () => undefined);
    this.responseStatus = status;
  }
}