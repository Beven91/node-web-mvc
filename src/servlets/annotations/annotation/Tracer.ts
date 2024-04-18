

const tracerSymbol = Symbol('tracer')

export default class Tracer {

  public readonly id: string;

  constructor(error: Error) {
    if (error) {
      const dependencies = error.stack.split('\n').slice(2, 10).map((m) => m.split('(').pop().split(':').shift());
      this.id = dependencies[0];
    }
  }

  static setTracer(clazz: Function, tracer: Tracer) {
    if (clazz) {
      Object.defineProperty(clazz, tracerSymbol, {
        configurable: true,
        get() {
          return tracer;
        }
      })
    }
  }

  static getTracer(clazz: Function) {
    if (clazz) {
      return clazz[tracerSymbol] as Tracer;
    }
  }

  static isDependency(clazz: Function, file) {
    return this.getTracer(clazz)?.isDependency?.(file) === true;
  }

  isDependency(file: string) {
    return this.id.indexOf(file) > -1;
  }
}