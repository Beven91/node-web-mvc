import { ClazzType } from './declare';

export default class Method {
  readonly clazz: ClazzType;

  readonly handler: Function;

  constructor(handler: Function, clazz: ClazzType) {
    this.handler = handler;
    this.clazz = clazz;
  }
}
