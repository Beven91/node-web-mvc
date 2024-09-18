

export default class Exception extends Error {
  public readonly data: any;
  constructor(message?: string, data?: any) {
    super(message);
    this.name = this.constructor.name;
    if (data) {
      this.data = data;
    }
  }
}
