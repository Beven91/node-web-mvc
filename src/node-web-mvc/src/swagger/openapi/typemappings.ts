import Javascript from '../../interface/Javascript';
import { MetaRuntimeTypeInfo } from '../../servlets/annotations/annotation/type';
import MultipartFile from '../../servlets/http/MultipartFile';
import HttpEntity from '../../servlets/models/HttpEntity';
import { ApiModelPropertyInfo, SchemeRef, GenericTypeSchemeRefExt } from './declare';

const alias: Record<string, any> = {
  'undefined': { type: 'string' },
  'object': { type: 'object', additionalProperties: true },
  'boolean': { type: 'boolean' },
  'number': { type: 'integer' },
  'bigint': { type: 'number', format: 'biginteger' },
  'string': { type: 'string' },
  'symbol': { type: 'string' },
  'function': { type: 'function' },
  'MultipartFile': { type: 'file' },
  'MultipartFile[]': { type: 'array', items: { type: 'file' } },
};

const mappings = [
  { clazz: String, data: { type: 'string' } },
  { clazz: Symbol, data: alias['symbol'] },
  { clazz: Date, data: { type: 'string', format: 'date-time' } },
  { clazz: Boolean, data: alias['boolean'] },
  { clazz: Number, data: alias['number'] },
  { clazz: BigInt, data: alias['bigint'] },
  { clazz: Array, data: { type: 'array', items: { type: 'string' } } },
  { clazz: SharedArrayBuffer, data: { type: 'array', items: { type: 'binary' } } },
  { clazz: Int8Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Int32Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Int16Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint16Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint32Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint8Array, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: Uint8ClampedArray, data: { type: 'array', items: { type: 'integer' } } },
  { clazz: MultipartFile, data: alias['MultipartFile'] },
  { clazz: HttpEntity, data: { type: 'string', format: 'binary' } },
  { clazz: Buffer, data: { type: 'string', format: 'binary' } },
  { clazz: Function, data: alias['object'] },
  { clazz: WeakMap, data: alias['object'] },
  { clazz: Map, data: alias['object'] },
];

export default class TypeMappings {
  public readonly referenceTypes: GenericTypeSchemeRefExt[] = [];

  makeRef(runtimeType: MetaRuntimeTypeInfo) {
    return this.makeMetaRef(runtimeType).refType;
  }

  makeMetaRef(runtimeType: MetaRuntimeTypeInfo) {
    const idName = runtimeType.fullName || runtimeType.name; // .replace(/<|>|\[|\]/g, '');
    const type = { '$ref': `#/components/schemas/${idName}` };
    const genericType = {
      refType: type,
      runtimeType: runtimeType,
      name: idName,
    };
    this.referenceTypes.push(genericType);
    return genericType;
  }


  make(runtimeType: MetaRuntimeTypeInfo): SchemeRef | ApiModelPropertyInfo {
    const typer = Javascript.createTyper(runtimeType.clazz);
    const args = runtimeType.args || [];
    if (runtimeType.tp) {
      // 如果是泛型参数
      return { type: 'object' };
    } else if (!runtimeType.clazz) {
      // 如果没有类型定义，只是字符串
      return alias[runtimeType.name] || { type: 'object' };
    } else if (runtimeType.enum) {
      // 枚举类型
      return {
        type: 'string',
        enum: Object.keys(runtimeType.clazz).filter((m: any) => isNaN(m)),
      };
    } else if (runtimeType.clazz == Object) {
      return alias['object'];
    } else if (typer.isType(Promise)) {
      // 如果是Promise
      return args.length > 0 ? this.make(args[0]) : { type: 'object' };
    } else if (typer.isType(Set) || typer.isType(WeakSet) || typer.isType(Array)) {
      // 如果是Set WeakSet
      return { type: 'array', items: args.length > 0 ? this.make(args[0]) : { type: 'string' } };
    } else if (runtimeType.array) {
      const newRuntimeType = {
        ...runtimeType,
        array: false,
      };
      // 如果是数组
      return {
        type: 'array',
        items: this.make(newRuntimeType),
      };
    };
    const basicType = mappings.find((m) => typer.isType(m.clazz))?.data;
    // 如果存在基本类型定义则返回，否则创建引用类型
    return basicType ? basicType : this.makeRef(runtimeType);
  }
}
