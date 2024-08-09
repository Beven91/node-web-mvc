
import 'reflect-metadata';
import Tracer from './Tracer';
import MetaRuntimeType, { MetaRuntimeTypeInfo } from '../MetaRuntimeType';

const decorate = Reflect.decorate;

(Reflect as any).RuntimeType = function(name: string, info: MetaRuntimeTypeInfo) {
  if (info) {
    info.fullName = name;
  }
  const handler = MetaRuntimeType({
    value: name,
    type: info,
  });
  return handler;
};

Reflect.decorate = function(decorators: any[], target: any, propertyKey?: string | symbol, attributes?: PropertyDescriptor | null) {
  if (!Tracer.hasTracer(target)) {
    const tracer = new Tracer(new Error());
    Tracer.setTracer(target, tracer);
  }
  // eslint-disable-next-line prefer-rest-params
  return decorate.apply(this, arguments);
};
