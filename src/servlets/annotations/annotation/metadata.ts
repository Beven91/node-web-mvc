
import 'reflect-metadata';
import Tracer from './Tracer';

const decorate = Reflect.decorate;

Reflect.decorate = function (decorators: any[], target: any, propertyKey?: string | symbol, attributes?: PropertyDescriptor | null) {
  const tracer = new Tracer(new Error());
  Tracer.setTracer(target, tracer);
  return decorate.apply(this, arguments);
}