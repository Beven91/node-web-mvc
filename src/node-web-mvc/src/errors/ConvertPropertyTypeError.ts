import Exception from './Exception';

export default class ConvertPropertyTypeError extends Exception {
  reason: Error;

  constructor(proeprty: string, reason: Error) {
    super(`Convert property fail at field: '${proeprty}', reason: ${reason.message}`);
    this.reason = reason;
  }
}
