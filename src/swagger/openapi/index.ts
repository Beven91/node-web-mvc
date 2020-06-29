/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import RouteCollection from '../../routes/RouteCollection';
import ControllerManagement from '../../ControllerManagement';
import { ApiOptions, ApiOperationOptions, ApiImplicitParamOptions } from './declare';
import { ApiModelOptions, ApiModelPropertyOptions, OperationsDoc, OperationPathMap } from './declare';
import { NodeHotModule } from '../../hot';
import HotModule from '../../hot/HotModule';

const documentation = {
  info: {} as any,
  tags: [],
  paths: {} as OperationsDoc,
  servers: {} as any,
  // components: {
  //   parameters: {},
  //   schemas: {}
  // },
  // openapi: '3.0.1',
  definitions: {},
  swagger: '2.0',
};

export default class OpenApiModel {

  /**
   * 初始化swagger文档配置
   */
  static initialize() {
    // 加载swagger-controller
    require('../controllers/SwaggerController');
    // 获取当前工程的信息
    const pkg = require(path.resolve('package.json'));
    documentation.info.title = pkg.name;
    documentation.info.version = pkg.version;
    documentation.info.description = pkg.description || '';
    // 初始化server 地址信息
    documentation.servers = [
      { url: RouteCollection.base || '/' }
    ]
  }

  /**
   * 获取完整的swaager openapi.json
   */
  static toJSON() {
    return JSON.stringify(documentation);
  }

  /**
   * 新增api
   * @param { ApiOptions  } api 修饰的接口配置
   * @param { Controller } controller 修饰的控制器
   */
  static addApi(api: ApiOptions, controller) {
    api = (api || {}) as ApiOptions;
    const descriptor = ControllerManagement.getControllerDescriptor(controller);
    const tags = documentation.tags;
    const name = this.clampName(controller.name);
    const values = (api.tags || [api.value || name]);
    const swagger = descriptor.swagger = { tags: [], methods: {} };
    values
      .map((s) => s.trim())
      .filter((s) => !tags.find((t) => t.name === s))
      .forEach((s) => {
        tags.push({ name: s, description: api.description });
        swagger.tags.push(s);
        return s;
      });
  }

  /**
   * 添加操作
   * @param { ApiOptions  } operation 修饰的接口方法配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperation(operation: ApiOperationOptions, ctor, name) {
    const paths = documentation.paths;
    const descriptor = ControllerManagement.getControllerDescriptor(ctor);
    const actionDescriptor = descriptor.actions[name];
    if (!actionDescriptor) {
      return;
    }
    if (!descriptor.swagger) {
      this.addApi({}, ctor)
    }
    const mainMapping = descriptor.mapping;
    const swagger = descriptor.swagger;
    const mapping = actionDescriptor.mapping;
    const schemas = documentation.definitions;
    const code = 'code' in operation ? operation.code : '200';
    const model = schemas[operation.dataType];
    const operationDoc = {
      consumes: mainMapping.consumes || undefined,
      deprecated: false,
      operationId: name,
      tags: swagger.tags,
      summary: operation.value,
      description: operation.notes,
      parameters: {},
      responses: {
        "201": { "description": "Created" },
        "401": { "description": "Unauthorized" },
        "403": { "description": "Forbidden" },
        "404": { "description": "Not Found" }
      }
    }
    operationDoc.responses[code] = {
      "description": "OK",
      "schema": {
        type: model ? undefined : operation.dataType,
        $ref: model ? '#/definitions/' + operation.dataType : undefined
      }
    }
    const desc = swagger.methods[name] = { path: [], doc: operationDoc };
    mainMapping.value.forEach((m) => {
      mapping.value.forEach((url) => {
        url = m + url;
        Object.keys(mapping.method).forEach((method) => {
          const path = (paths[url] = {}) as OperationPathMap;
          path[method.toLowerCase()] = operationDoc;
          desc.path.push(url);
        });
      })
    })
  }

  /**
   * 添加操作参数列表
   * @param { ApiOptions  } params 修饰的接口方法的参数配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperationParams(params: Array<ApiImplicitParamOptions>, ctor, name) {
    const descriptor = ControllerManagement.getControllerDescriptor(ctor);
    const swagger = descriptor.swagger;
    const operationDoc = swagger.methods[name].doc;
    const schemas = documentation.definitions;
    // const mapping = descriptor.mapping;
    operationDoc.parameters = [];
    params.forEach((param) => {
      const model = schemas[param.dataType];
      if (param.dataType === 'file' && !operationDoc.consumes) {
        operationDoc.consumes = ['multipart/form-data'];
      }
      operationDoc.parameters.push({
        name: param.name,
        required: param.required,
        description: param.value,
        in: param.dataType === 'file' ? 'formData' : param.paramType,
        type: model ? undefined : param.dataType || 'string',
        schema: {
          $ref: model ? '#/definitions/' + param.dataType : undefined,
        }
      })
    })
  }

  /**
   * 添加实体类
   * @param { ApiModelOptions } modelOptions 修饰的实体类配置
   * @param { model } 修饰的实体类类
   */
  static addModel(modelOptions: ApiModelOptions, model) {
    const schemas = documentation.definitions;
    schemas[model.name] = {
      title: modelOptions.value || model.name,
      description: modelOptions.description,
      properties: {}
    }
  }

  /**
   * 添加实体类字段
   * @param { ApiModelOptions } propertyOptions 修饰的实体类属性配置
   * @param { model } 修饰的实体类类
   * @param { Sting } name 修饰的属性名
   */
  static addModelProperty(propertyOptions: ApiModelPropertyOptions, model, name) {
    const schemas = documentation.definitions;
    const schema = schemas[model.name];
    const properties = schema.properties;
    properties[name] = {
      description: propertyOptions.value,
      required: propertyOptions.required,
      example: propertyOptions.example,
      type: typeof (propertyOptions.example || '')
    }
  }

  /**
   * 驼峰命名转换成 - 符号链接
   */
  static clampName(name) {
    const k = name.length;
    let newName = '';
    for (let i = 0; i < k; i++) {
      const code = name.charCodeAt(i);
      const isUpperCase = code >= 65 && code <= 90;
      const joinChar = isUpperCase ? '-' : '';
      newName = newName + joinChar + (name[i]).toLowerCase();
    }
    return newName.replace(/^-/, '');
  }
}

/**
 * 内部热更新
 */
const mod = (module as NodeHotModule);
mod.hot = new HotModule(mod.filename);
mod.hot.preload((old) => {
  // 预更新时，判断当前模块是否为被修饰的类
  const info = old.exports.default || old.exports;
  const schemas = documentation.definitions;
  const descriptor = ControllerManagement.getControllerDescriptor(info);
  const swagger = descriptor.swagger;
  if (swagger) {
    const map = swagger.tags.reduce((map, k) => (map[k] = true, map), {});
    // 移除掉旧的tags
    documentation.tags = documentation.tags.filter((s) => !map[s.name]);
    // 移除掉旧的方法文档
    Object.keys(swagger.methods).forEach((k) => {
      const method = swagger.methods[k];
      method.path.forEach((url) => {
        delete documentation.paths[url];
      });
    });
  }
  // 删除schema
  delete schemas[info.name];
})