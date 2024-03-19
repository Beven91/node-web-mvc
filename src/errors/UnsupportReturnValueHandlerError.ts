
export default class UnsupportReturnValueHandlerError extends Error {

  public readonly returnValue: any

  constructor(message: string, returnValue: any) {
    super(message);
    this.returnValue = returnValue;
  }
}