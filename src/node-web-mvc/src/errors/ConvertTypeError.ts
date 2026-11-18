import { ClazzType } from '../interface/declare';
import Exception from './Exception';

export default class ConvertTypeError extends Exception {
  constructor(input: string, targetType: ClazzType) {
    super(`Cannot convert : '${input}' to clazz ${targetType}`);
  }
}
