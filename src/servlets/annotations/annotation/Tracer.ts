

const tracerSymbol = Symbol('tracer')

export default class Tracer {

  private readonly dependencies: string[] = []

  public readonly id: string;

  constructor(error: Error) {
    if (error) {
      this.dependencies = error.stack.split('\n').slice(0, 10).map((m) => m.split('(').pop().split(':').shift());
      // TODO: fill id
      this.id = '';
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

  isDependency(file: string) {
    return !!this.dependencies.find((m) => m.indexOf(file) > -1)
  }
}