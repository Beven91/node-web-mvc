
import path from 'path';
import process from 'process';

const tracerSymbol = Symbol('tracer')


export default class Tracer {

  public readonly id: string;

  constructor(error: Error) {
    if (error) {
      const dependencies = error.stack.split('\n').slice(2, 10).map((m) => {
        return m.split('(').pop().replace(/(:\d+)+/, '').replace(/\)$/, '');
      });
      this.id = dependencies[0];
    }
  }

  static hasTracer(clazz: Function) {
    if (!clazz) return false;
    return !!clazz[tracerSymbol];
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

  static getClassPath(id: string, suffix?: string) {
    const root = process.cwd();
    const ext = path.extname(id);
    const prefix = id.split(root).pop().replace(ext, '');
    return suffix ? `${prefix}#${suffix}` : prefix;
  }

  static getFullName(clazz: Function, suffix?: string) {
    if (!clazz) {
      return suffix;
    }
    const id = this.getTracer(clazz)?.id;
    return this.getClassPath(id || clazz.name, suffix);
  }

  static isDependency(clazz: Function, file) {
    return this.getTracer(clazz)?.isDependency?.(file) === true;
  }

  isDependency(file: string) {
    return this.id.indexOf(file) > -1;
  }
}