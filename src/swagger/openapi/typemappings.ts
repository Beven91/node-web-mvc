import Javascript from "../../interface/Javascript";
import MultipartFile from "../../servlets/http/MultipartFile";
import { ApiModelPropertyInfo, SchemeRef } from "./declare";

const alias: Record<string, any> = {
  'undefined': { type: 'string' },
  'object': { type: 'object' },
  'boolean': { type: 'boolean' },
  'number': { type: 'integer' },
  'bigint': { type: 'number', format: 'biginteger' },
  'string': { type: 'string' },
  'symbol': { type: 'string' },
  'function': { type: 'function' },
  'MultipartFile': { type: 'file' },
  'MultipartFile[]': { type: 'array', items: { type: 'file' } },
}

const mappings = [
  { clazz: String, data: { type: 'string' } },
  { clazz: Symbol, data: { type: 'string' } },
  { clazz: Date, data: { type: 'string', format: 'date-time' } },
  { clazz: Boolean, data: { type: 'boolean' } },
  { clazz: Number, data: { type: 'integer' } },
  { clazz: BigInt, data: { type: 'number', format: 'biginteger' } },
  { clazz: Array, data: { type: 'array', items: { type: 'stirng' } } },
  { clazz: SharedArrayBuffer, data: { type: 'array', items: { type: 'binary' } } },
  { clazz: Int8Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Int32Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Int16Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint16Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint32Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint8Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint8ClampedArray, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Set, data: { type: 'array', items: { type: 'stirng' } } },
  { clazz: WeakSet, data: { type: 'array', items: { type: 'stirng' } } },
  { clazz: WeakMap, data: { type: 'object' } },
  { clazz: Map, data: { type: 'object' } },
  { clazz: MultipartFile, data: { type: 'file' } },
  { clazz: Buffer, data: { type: 'binary' } },
  { clazz: Function, data: { type: 'object' } },
  { clazz: Promise, data: { type: 'object' } },
]

export default class TypeMappings {

  public readonly referenceTypes: SchemeRef[] = [];

  makeRef(name) {
    const type = { '$ref': `#/components/schemas/${name}` };
    this.referenceTypes.push(type);
    return type;
  }


  makeRefType(typeName: string) {
    if (!typeName) {
      return null;
    } else if (/</.test(typeName)) {
      // 泛型处理
      return this.makeRef(typeName);
    } else if (alias[typeName]) {
      return alias[typeName];
    } else {
      return this.makeRef(typeName);
    }
  }

  make(type: any): SchemeRef | ApiModelPropertyInfo {
    const clazz = Javascript.createTyper(type);
    const basicType = mappings.find((m) => clazz.isType(m.clazz))?.data;
    if (type === Object) {
      return { type: 'object' };
    } else if (basicType) {
      return basicType;
    } else if (typeof type === 'string') {
      return this.makeRefType(type);
    } else if (type?.name && clazz.isType(Object)) {
      return this.makeRef(type.name);
    } else {
      return { type: 'string' }
    }
  }
}