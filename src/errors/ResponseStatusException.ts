
export default class ResponseStatusException extends Error {

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