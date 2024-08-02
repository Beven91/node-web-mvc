
import 'reflect-metadata';
import Tracer from './Tracer';
import MetaRuntimeType from '../MetaRuntimeType';

const decorate = Reflect.decorate;

(Reflect as any).RuntimeType = function(paramterType: string, ...parameters) {
  return MetaRuntimeType({
    value: paramterType,
    parameters: parameters,
  });
};

Reflect.decorate = function(decorators: any[], target: any, propertyKey?: string | symbol, attributes?: PropertyDescriptor | null) {
  if (!Tracer.hasTracer(target)) {
    const tracer = new Tracer(new Error());
    Tracer.setTracer(target, tracer);
  }
  // eslint-disable-next-line prefer-rest-params
  return decorate.apply(this, arguments);
};
