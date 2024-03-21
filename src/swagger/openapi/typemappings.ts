import Javascript from "../../interface/Javascript";
import MultipartFile from "../../servlets/http/MultipartFile";
import { SchemeRef } from "./declare";

const alias = {
  'undefined': { type: 'string' },
  'object': { type: 'object' },
  'boolean': { type: 'boolean' },
  'number': { type: 'integer' },
  'bigint': { type: 'number', format: 'biginteger' },
  'string': { type: 'string' },
  'symbol': { type: 'string' },
  'function': { type: 'function' },
}

const mappings = [
  { clazz: String, data: { type: 'string' } },
  { clazz: Symbol, data: { type: 'string' } },
  { clazz: Date, data: { type: 'string', format: 'date-time' } },
  { clazz: Boolean, data: { type: 'boolean' } },
  { clazz: Number, data: { type: 'integer' } },
  { clazz: BigInt, data: { type: 'number', format: 'biginteger' } },
  { clazz: Array, data: { type: 'array' } },
  { clazz: SharedArrayBuffer, data: { type: 'array', items: { type: 'binary' } } },
  { clazz: Int8Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Int32Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Int16Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint16Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint32Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint8Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint8ClampedArray, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Set, data: { type: 'array' } },
  { clazz: WeakSet, data: { type: 'array' } },
  { clazz: WeakMap, data: { type: 'object' } },
  { clazz: Map, data: { type: 'object' } },
  { clazz: MultipartFile, data: { type: 'file' } },
  { clazz: Buffer, data: { type: 'binary' } },
  { clazz: Function, data: { type: 'object' } },
]

export default class TypeMappings {

  public readonly genericTypes: SchemeRef[] = [];

  makeRef(name) {
    return `#/components/schemas/${name}`;
  }

  makeRefType(typeName: string) {
    if (!typeName) {
      return null;
    } else if (/</.test(typeName)) {
      // 泛型处理
      const genericType = { '$ref': this.makeRef(typeName) };
      this.genericTypes.push(genericType);
      return genericType;
    } else if (alias[typeName]) {
      return alias[typeName];
    } else {
      return { '$ref': this.makeRef(typeName) };
    }
  }

  make(type: any) {
    const clazz = Javascript.getClass(type);
    const basicType = mappings.find((m) => clazz.isEqualOrExtendOf(m.clazz))?.data;
    if (basicType) {
      return basicType;
    } else if (typeof type === 'string') {
      return this.makeRefType(type);
    } else if (type?.name) {
      return { '$ref': this.makeRef(type.name) };
    } else {
      return { type: 'string' }
    }
  }
}