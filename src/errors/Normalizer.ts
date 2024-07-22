import Exception from "./Exception";


export default class Normalizer {
  static normalizeError(ex: any) {
    if (ex instanceof Error || (typeof ex === 'object' && ex)) {
      return ex;
    } else if (typeof ex === 'string') {
      return new Error(ex);
    } else {
      return new Exception('', ex);
    }
  }
}