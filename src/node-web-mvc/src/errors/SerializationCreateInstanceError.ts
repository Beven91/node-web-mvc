import Exception from './Exception';

export default class SerializationCreateInstanceError extends Exception {
  constructor(type: Function, message: string) {
    super(`Cannot create ${type.name} instance fail ` + message);
  }
}
