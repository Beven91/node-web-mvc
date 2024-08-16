
import 'reflect-metadata';
import Tracer from './Tracer';
import { MetaRuntimeTypeInfo } from './type';
import Javascript from '../../../interface/Javascript';

const decorate = Reflect.decorate;
const metadata = Reflect.metadata;

function getParameterKey(name: string, idx: number) {
  return `${name}@@@${idx}`;
}

function myMetadata(metadataKey: any, metadataValue: any) {
  return function decorator(target: any, property: string, idx?: number) {
    // 支持参数元数据
    const newMetadataKey = idx >= 0 ? getParameterKey(metadataKey, idx) : metadataKey;
    return metadata.call(this, newMetadataKey, metadataValue)(target, property);
  } as any;
};

function myDecorator(decorators: any[], target: any, propertyKey?: string | symbol, attributes?: PropertyDescriptor | null) {
  if (!Tracer.hasTracer(target)) {
    const tracer = new Tracer(new Error());
    Tracer.setTracer(target, tracer);
  }
  // eslint-disable-next-line prefer-rest-params
  return decorate.apply(this, arguments);
};

export function getRuntimeType(name: string, target: any, key: string | symbol, idx?: number) {
  const id = 'design:runtimetype';
  const propertyKey = idx >= 0 ? getParameterKey(id, idx) : key;
  const runtimeType = Reflect.getMetadata(propertyKey, target, key) as MetaRuntimeTypeInfo;
  const metaType = Reflect.getMetadata(name, target, key);
  let runtimeTypeInfo: MetaRuntimeTypeInfo = null;
  if (idx >= 0) {
    const params = metaType || [];
    runtimeTypeInfo = buildRuntimeType(params[idx], runtimeType);
  } else {
    runtimeTypeInfo = buildRuntimeType(metaType, runtimeType);
  }
  if (!runtimeType) {
    myMetadata(id, runtimeTypeInfo)(target, propertyKey, idx);
  }
  return runtimeTypeInfo;
}

export const buildRuntimeType = (metaType: any, runtimeType: MetaRuntimeTypeInfo): MetaRuntimeTypeInfo => {
  if (!runtimeType) {
    runtimeType = {
      clazz: metaType,
      name: metaType?.name,
      fullName: metaType?.name,
      array: Javascript.createTyper(metaType).isType(Array),
    };
  }
  return runtimeType;
};

Reflect.metadata = myMetadata;

Reflect.decorate = myDecorator;
