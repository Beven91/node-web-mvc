/**
 * @module Definition
 * @description 用于解决typescript 下泛型等类型解析
 * https://petstore.swagger.io/v2/swagger.json
 * https://generator3.swagger.io/openapi.json
 */
import MultipartFile from "../../servlets/http/MultipartFile";
import { ApiModelMeta, DefinitionInfo } from "./declare";

// 所有注册models
const definitions = {} as { [propName: string]: ApiModelMeta };

const runtime = {
  id: 0
}


export default class Definition {

  /**
   * 所有的model定义
   */
  static get definitions() {
    return definitions;
  }

  static makeRef(name) {
    return `#/definitions/${name}`;
  }

  /**
   * 获取最后可用的定义数据
   * @param dataType 
   */
  static getFinalDefinitions() {
    const tempDefinitions = {};
    const finalDefinitions = {};
    // 梳理定义
    Object
      .keys(definitions)
      .forEach((key) => {
        const definition = definitions[key];
        const parentCtor = (definition.ctor as any).__proto__;
        const parentName = parentCtor?.name;
        const parent = definitions[parentName];
        const ctorName = definition.name || definition.ctor.name;
        tempDefinitions[key] = {
          title: definition.title ? `${definition.title} - ${ctorName}` : ctorName,
          description: definition.description,
          properties: this.buildFinalDefinitionProperties(definition),
        }
        if (parent && parentCtor !== definition.ctor) {
          tempDefinitions[key] = {
            allOf: [
              tempDefinitions[key],
              { $ref: this.makeRef(parentName) },
            ]
          }
        }
      });
    // 筛选，返回最终需要的定义
    Object
      .keys(tempDefinitions)
      .filter((k) => !/<\d+>/.test(k))
      .forEach((k) => {
        finalDefinitions[k] = tempDefinitions[k];
      })
    return finalDefinitions
  }

  private static buildFinalDefinitionProperties(definition: ApiModelMeta) {
    const properties = definition.properties;
    const finalProperties = {};
    Object.keys(properties).forEach((key) => {
      const property = properties[key];
      const info = this.getDefinitionByName(property.type);
      if (info.type === 'array') {
        info.items = property.items ? property.items : info.items;
        finalProperties[key] = info;
      } else if (info.schema) {
        finalProperties[key] = info.schema;
      } else {
        finalProperties[key] = property;
      }
    })
    return finalProperties;
  }

  /**
   * 判断类型是否为数组类型
   * @param dataType 
   */
  private static isArray(dataType) {
    return dataType === 'List' || dataType === 'Array' || dataType === 'array' || /\[\]/.test(dataType);
  }

  private static createGenericT(property, define) {
    const parts = define.name.split(',');
    const isArray = define.type === 'array';
    let data = { empty: true } as any;
    if (/<\d+>/.test(property.type)) {
      let genericName = property.type;
      parts.forEach((name, index) => {
        genericName = genericName.replace(`<${index + 1}>`, `<${name}>`);
      })
      data = this.getDefinitionByName(genericName);
    }
    if (data.empty) {
      return isArray ? { type: 'array', items: define.items } : { '$ref': this.makeRef(define.name) };
    } else {
      return data.type === 'array' ? { type: 'array', items: data.items } : data.schema;
    }
  }

  private static createDefinition(model: ApiModelMeta, nowKey, define) {
    const properties = model.properties;
    const newModel = {
      ctor: model.ctor,
      title: model.title,
      name: nowKey,
      description: model.description,
      properties: {}
    };
    Object.keys(properties).map((k) => {
      const property = properties[k];
      if (property.generic) {
        newModel.properties[k] = this.createGenericT(property, define);
      } else {
        newModel.properties[k] = {
          ...properties[k]
        }
      }
    });
    definitions[nowKey] = newModel;
    return { name: nowKey }
  }

  private static parseDefinition(define, key): DefinitionInfo {
    const defineModel = definitions[define.name];
    // console.log(define,key)
    const nowKey = define.name ? `${key}<${define.name}>` : key;
    const model = definitions[key];
    if (definitions[nowKey]) {
      return { name: nowKey, type: '' };
    } else if (this.isArray(key)) {
      const name = key.replace('[]', '');
      const model = defineModel || definitions[name];
      return {
        type: 'array',
        name: nowKey,
        items: {
          '$ref': model ? this.makeRef(define.name || name) : undefined,
          'type': model ? undefined : define.name || 'string'
        }
      };
    } else if (model) {
      return this.createDefinition(model, nowKey, define);
    } else if (defineModel) {
      return this.createDefinition(defineModel, nowKey, define);
    } else {
      console.warn('找不到实体:', key);
      return { name: nowKey };
    }
  }

  static getDefinition(dataType: any) {
    if (typeof dataType === 'string') {
      return this.getDefinitionByName(dataType);
    } else {
      return this.getDefinitionByType(dataType);
    }
  }

  /**
   * 解析paramType类型
   * @param {String} paramType 类型字符串
   * List<A>
   * Map<K,V>
   */
  static getDefinitionByName(dataType: any) {
    const model = definitions[dataType];
    if (model) {
      return { schema: { '$ref': this.makeRef(dataType) } };
    } else if (/</.test(dataType)) {
      // 泛型处理
      const parts = dataType.split('<').map((key) => key.replace(/\>/g, ''));
      const defaultInfo = { type: '', name: '' } as DefinitionInfo;
      const data = parts.reverse().reduce((define, key) => this.parseDefinition(define, key), defaultInfo);
      const ref = this.makeRef(data.name);
      const isArray = data.type === 'array';
      return isArray ? { collectionFormat: 'multi', type: 'array', items: data.items } : { schema: { '$ref': ref } };
    } else if (dataType === 'array') {
      return { type: 'array', collectionFormat: 'multi', items: { type: 'string' }, k: true };
    } else if (dataType === 'date-time') {
      return { type: 'string', format: 'date-time' };
    } else {
      return { empty: true };
    }
  }

  static getDefinitionByType(dataType: any) {
    const model = this.reflectDefinition(dataType);
    if (model.type) {
      return { schema: model }
    }
    return model;
  }

  static reflectTypeName(value) {
    switch (value) {
      case String:
      case Symbol:
        return 'string';
      case Date:
        return 'date-time';
      case Boolean:
        return 'boolean';
      case Number:
        return 'integer';
      case BigInt:
        return 'string';
      case Function:
        return this.functionNameType(value);
      case Array:
      case SharedArrayBuffer:
      case Int8Array:
      case Int32Array:
      case Int16Array:
      case Uint16Array:
      case Uint32Array:
      case Uint8Array:
      case Uint8ClampedArray:
        return 'array';
      case Set:
      case WeakSet:
        return 'array';
      case WeakMap:
      case Map:
        return 'object';
      default:
        return this.instanceType(value) || 'string';
    }
  }

  private static functionNameType(value) {
    const name = value.name;
    return name === 'Object' ? 'string' : name || 'string';
  }

  private static instanceType(value) {
    const name = typeof value;
    if (value instanceof MultipartFile || value === MultipartFile) {
      return 'file';
    } else if (value instanceof Buffer || value && /Buffer/.test(value.name)) {
      return 'binary';
    } else if (value instanceof Date) {
      return 'date-time';
    } else if (value instanceof Array || value && /Array/.test(value.name)) {
      return 'array';
    } else if (name === 'function') {
      return this.functionNameType(value)
    } else {
      return name;
    }
  }

  static reflectDefinition(value) {
    if (!value) {
      return { type: 'string', example: value }
    } else if (value instanceof Array) {
      return {
        type: 'array',
        items: this.reflectDefinition(value[0])
      }
    } else if (value && typeof value === 'object') {
      const name = 'Anonymous' + (runtime.id++);
      const definition = definitions[name] = {
        title: name,
        name: name,
        description: '',
        ctor: null,
        properties: {}
      }
      Object.keys(value).forEach((key) => {
        definition.properties[key] = this.reflectDefinition(value[key]);
      })
      return {
        schema: { '$ref': this.makeRef(name) }
      }
    } else {
      const v = typeof value;
      return { type: v === 'undefined' ? 'string' : v, example: value }
    }
  }
}