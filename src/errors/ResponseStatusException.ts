import Exception from "./Exception";

export default class ResponseStatusException extends Exception {

  public readonly code: number

  public readonly reason: string

  constructor(code: number, reason: string) {
    super(`status=${code},reason=${reason}`);
    this.code = code;
    this.reason = reason;
  }

  public getResponseHeaders(): Record<string, any> {
    return {}
  }
}