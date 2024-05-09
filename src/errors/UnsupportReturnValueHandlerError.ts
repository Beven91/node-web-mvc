import Exception from "./Exception";

export default class UnsupportReturnValueHandlerError extends Exception {

  public readonly returnValue: any

  constructor(message: string, returnValue: any) {
    super(message);
    this.returnValue = returnValue;
  }
}