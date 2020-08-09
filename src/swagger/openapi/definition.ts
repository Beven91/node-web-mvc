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
    const finalDefinitions = {};
    // 定义的模块信息
    Object
      .keys(definitions)
      .filter((k) => references[k])
      .forEach((key) => {
        const definition = definitions[key];
        const ctorName = definition.name || definition.ctor.name;
        finalDefinitions[key] = {
          title: definition.title ? `${definition.title} - ${ctorName}` : ctorName,
          description: definition.description,
          properties: definition.properties,
        }
      });
    return finalDefinitions
  }

  /**
   * 判断类型是否为数组类型
   * @param dataType 
   */
  static isArray(dataType) {
    return dataType === 'List' || dataType === 'Array' || dataType === 'array';
  }

  static createDefinition(model: ApiModelMeta, nowKey, define) {
    const properties = model.properties;
    const newModel = {
      ctor: model.ctor,
      title: model.title,
      name:nowKey,
      description: model.description,
      properties: {}
    };
    Object.keys(properties).map((k) => {
      const property = properties[k];
      if (property.generic) {
        const isArray = define.type === 'array';
        newModel.properties[k] = isArray ? { type: 'array', items: define.items } : { '$ref': this.makeRef(define.name) }
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
    } else {
      return this.createDefinition(defineModel, nowKey, define);
    }
  }

  /**
   * 解析paramType类型
   * @param {String} paramType 类型字符串
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
      return {};
    }
  }
}