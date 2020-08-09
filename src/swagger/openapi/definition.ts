/**
 * @module Definition
 * @description 用于解决typescript 下泛型等类型解析
 */
import { ApiModelMeta, DefinitionInfo } from "./declare";

// 所有注册models
const definitions = {} as { [propName: string]: ApiModelMeta };

let references = {};

export default class Definition {

  /**
   * 所有的model定义
   */
  static get definitions() {
    return definitions;
  }

  static makeRef(name) {
    references[name] = true;
    return `#/definitions/${name}`;
  }

  static cleanReference() {
    references = {};
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
        const ctorName = definition.name || definition.ctor.name;
        tempDefinitions[key] = {
          title: definition.title ? `${definition.title} - ${ctorName}` : ctorName,
          description: definition.description,
          properties: this.buildFinalDefinitionProperties(definition),
        }
      });
    // 筛选，返回最终需要的定义
    Object
      .keys(tempDefinitions)
      .filter((k) => references[k])
      .forEach((k) => {
        finalDefinitions[k] = tempDefinitions[k];
      })
    return finalDefinitions
  }

  static buildFinalDefinitionProperties(definition: ApiModelMeta) {
    const properties = definition.properties;
    const finalProperties = {};
    Object.keys(properties).forEach((key) => {
      const property = properties[key];
      const info = this.getDefinitionModel(property.type);
      if (info.type === 'array') {
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
  static isArray(dataType) {
    return dataType === 'List' || dataType === 'Array' || dataType === 'array';
  }

  static createGenericT(property, define) {
    const parts = define.name.split(',');
    const isArray = define.type === 'array';
    let data = { empty: true } as any;
    if (/<\d+>/.test(property.type)) {
      let genericName = property.type;
      parts.forEach((name, index) => {
        genericName = genericName.replace(`<${index + 1}>`, `<${name}>`);
      })
      data = this.getDefinitionModel(genericName);
    }
    if (data.empty) {
      return isArray ? { type: 'array', items: define.items } : { '$ref': this.makeRef(define.name) };
    } else {
      return data.type === 'array' ? { type: 'array', items: data.items } : data.schema;
    }
  }

  static createDefinition(model: ApiModelMeta, nowKey, define) {
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

  static parseDefinition(define, key): DefinitionInfo {
    const defineModel = definitions[define.name];
    const nowKey = define.name ? `${key}<${define.name}>` : key;
    const model = definitions[key];
    if (definitions[nowKey]) {
      return { name: nowKey, type: '' };
    } else if (this.isArray(key)) {
      return {
        type: 'array',
        name: nowKey,
        items: {
          '$ref': defineModel ? this.makeRef(define.name) : undefined,
          'type': defineModel ? undefined : define.name || 'string'
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

  /**
   * 解析paramType类型
   * @param {String} paramType 类型字符串
   * List<A>
   * Map<K,V>
   */
  static getDefinitionModel(dataType: string) {
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
      return isArray ? { type: 'array', items: data.items } : { schema: { '$ref': ref } };
    } else {
      return { empty: true };
    }
  }
}