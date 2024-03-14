

export default class Normalizer {
  static normalizeError(ex: any) {
    if (ex instanceof Error) {
      return ex;
    } else {
      return new Error(ex?.message || ex?.errorMessage || ex?.errMsg || String(ex));
    }
  }
}