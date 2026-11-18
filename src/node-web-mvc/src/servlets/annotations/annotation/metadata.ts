
import 'reflect-metadata';
import Tracer from './Tracer';
import { MetaRuntimeTypeInfo } from './type';
import Javascript from '../../../interface/Javascript';
import MetaProperty from '../MetaProperty';

const decorate = Reflect.decorate;
const metadata = Reflect.metadata;

const RuntimeTypeKey = 'design:runtimetype';

function getParameterKey(name: string, idx: number) {
  return `${name}@@@${idx}`;
}

function myMetadata(metadataKey: any, metadataValue: any) {
  return function decorator(this: any, target: any, property: string, index?: number) {
    const idx = (index === undefined || index === null) ? -1 : index;
    if (metadataKey == RuntimeTypeKey && arguments.length > 2) {
      MetaProperty(target, property, idx);
    }
    // 支持参数元数据
    const newMetadataKey = idx >= 0 ? getParameterKey(metadataKey, idx) : metadataKey;
    return metadata.call(this, newMetadataKey, metadataValue)(target, property);
  } as any;
};

// @need-check
function myDecorator(decorators: any[], target: any, propertyKey?: string | symbol, attributes?: PropertyDescriptor | null) {
  if (!Tracer.hasTracer(target)) {
    const tracer = new Tracer(new Error());
    Tracer.setTracer(target, tracer);
  }
  if (arguments.length === 2) {
    return decorate(decorators, target);
  } else if (arguments.length === 3) {
    return decorate(decorators, target, propertyKey!);
  } else {
    return decorate(decorators, target, propertyKey!, attributes!);
  }
};

export function getRuntimeType(name: string, target: any, key: string | symbol, index?: number) {
  const id = RuntimeTypeKey;
  const idx = (index === undefined || index === null) ? -1 : index;
  const propertyKey = idx >= 0 ? getParameterKey(id, idx) : id;
  const runtimeType = Reflect.getMetadata(propertyKey, target, key) as MetaRuntimeTypeInfo;
  const metaType = Reflect.getMetadata(name, target, key);
  let runtimeTypeInfo: MetaRuntimeTypeInfo;
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

export const buildRuntimeType = (metaType: any, runtimeType: MetaRuntimeTypeInfo | null): MetaRuntimeTypeInfo => {
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

Reflect.decorate = myDecorator as any;
