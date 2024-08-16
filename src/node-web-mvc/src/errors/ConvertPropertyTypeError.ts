import Exception from './Exception';

export default class ConvertPropertyTypeError extends Exception {
  reason: Exception;

  constructor(proeprty: string, reason: Exception) {
    super(`Convert property fail at field: '${proeprty}', reason: ${reason.message}`);
    this.reason = reason;
  }
}
