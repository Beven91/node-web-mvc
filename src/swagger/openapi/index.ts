/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import RouteCollection from '../../routes/RouteCollection';
import ControllerManagement from '../../ControllerManagement';
import { ApiOptions, ApiOperationOptions, ApiImplicitParamOptions, ApiModelMeta, ApiMeta, ApiOperationMeta } from './declare';
import { ApiModelOptions, ApiModelPropertyOptions, OperationsDoc, OperationPathMap } from './declare';
import hot from '../../hot';

// 获取当前工程的信息
const pkg = require(path.resolve('package.json'));

// 所有注册models
const definitions = {} as { [propName: string]: ApiModelMeta };

// 所有注册的接口
const apiMetaList = [] as Array<ApiMeta>

export default class OpenApiModel {
  /**
   * 初始化swagger文档配置
   */
  static initialize() {
    // 加载swagger-controller
    require('../controllers/SwaggerController');
  }

  /**
   * 获取或创建指定api定义
   * @param ctor 
   */
  private static createApi(ctor) {
    let api = apiMetaList.find((api) => api.class === ctor);
    if (!api) {
      const name = this.clampName(ctor.name);
      api = { class: ctor, operations: [], option: { tags: [name] } };
      apiMetaList.push(api);
    }
    return api;
  }

  /**
   * 获取或者创建一个api操作定义
   */
  private static createOperation(ctor, name, option: ApiOperationOptions) {
    const api = this.createApi(ctor);
    let operation = api.operations.find((operation) => operation.method === name);
    if (!operation) {
      operation = { api, consumes: null, method: name, option, parameters: [] };
      api.operations.push(operation);
    }
    return operation;
  }

  /**
   * 创建或者获取一个model定义
   * @param ctor model构造函数 
   */
  private static createApiModel(ctor) {
    const name = ctor.name;
    if (!definitions[name]) {
      definitions[name] = { title: '', description: '', properties: {} }
    }
    return definitions[name];
  }

  /**
   * 新增api
   * @param { ApiOptions  } option 修饰的接口配置
   * @param { Controller } controller 修饰的控制器
   */
  static addApi(option: ApiOptions, controller) {
    const name = this.clampName(controller.name);
    const api = this.createApi(controller);
    api.option = option;
    api.option.tags = (option.tags || [option.value || name])
  }

  /**
   * 添加接口操作
   * @param { ApiOptions  } option 修饰的接口方法配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperation(option: ApiOperationOptions, ctor, name) {
    const operation = this.createOperation(ctor, name, option);
    // option 强制使用当前配置的option
    operation.option = option;
  }

  /**
   * 添加接口操作参数定义
   * @param { ApiOptions  } params 修饰的接口方法的参数配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperationParams(params: Array<ApiImplicitParamOptions>, ctor, name) {
    params
      .filter((param) => !!param)
      .forEach((param) => this.addOperationParam(param, ctor, name))
  }

  /**
   * 添加接口操作参数
   * @param { ApiImplicitParamOptions  } param 修饰的接口方法的参数配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static addOperationParam(param: ApiImplicitParamOptions, ctor, name) {
    const operation = this.createOperation(ctor, name, {});
    operation.parameters.push({
      name: param.name,
      required: param.required,
      description: param.value,
      in: param.dataType === 'file' ? 'formData' : param.paramType,
      type: param.dataType,
      schema: {
        $ref: null,
      }
    });
  }

  /**
   * 添加实体类
   * @param { ApiModelOptions } modelOptions 修饰的实体类配置
   * @param { Constructor } ctor 修饰的实体类类
   */
  static addModel(modelOptions: ApiModelOptions, ctor) {
    const model = this.createApiModel(ctor);
    model.title = modelOptions.value || ctor.name;
    model.description = modelOptions.description;
  }

  /**
   * 添加实体类字段
   * @param { ApiModelOptions } propertyOptions 修饰的实体类属性配置
   * @param { model } 修饰的实体类类
   * @param { Sting } name 修饰的属性名
   */
  static addModelProperty(propertyOptions: ApiModelPropertyOptions, ctor, name) {
    const model = this.createApiModel(ctor);
    model.properties[name] = {
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

  /**
   * 获取完整的swaager openapi.json
   */
  static build() {
    const documentation = {
      info: {
        title: pkg.name,
        version: pkg.version,
        description: pkg.description || ''
      },
      tags: [],
      paths: {} as OperationsDoc,
      servers: [
        { url: RouteCollection.base || '/' }
      ],
      // components: {
      //   parameters: {},
      //   schemas: {}
      // },
      // openapi: '3.0.1',
      definitions: definitions,
      swagger: '2.0',
    };
    apiMetaList.forEach((api) => {
      const paths = documentation.paths;
      // 构建tags
      documentation.tags = documentation.tags.concat(api.option.tags || []);
      // 构建paths
      api.operations.forEach((operation) => this.buildOperation(paths, operation));
    })
    return documentation;
  }

  /**
   * 创建api操作的所有paths
   */
  private static buildOperation(paths, operation: ApiOperationMeta) {
    const option = operation.option;
    const api = operation.api;
    const descriptor = ControllerManagement.getControllerDescriptor(api.class);
    const actionDescriptor = descriptor.actions[operation.method];
    if (!actionDescriptor || !actionDescriptor.mapping) {
      return;
    }
    const mainMapping = descriptor.mapping;
    const mapping = actionDescriptor.mapping;
    const code = 'code' in option ? option.code : '200';
    const model = definitions[option.dataType];
    const operationDoc = {
      consumes: mainMapping.consumes || operation.consumes,
      deprecated: false,
      operationId: operation.method,
      tags: api.option.tags,
      summary: option.value,
      description: option.notes,
      parameters: this.buildOperationParameters(operation),
      responses: {
        "201": { "description": "Created" },
        "401": { "description": "Unauthorized" },
        "403": { "description": "Forbidden" },
        "404": { "description": "Not Found" },
        [code]: {
          "description": "OK",
          "schema": {
            type: model ? undefined : option.dataType,
            $ref: model ? '#/definitions/' + option.dataType : undefined
          }
        }
      }
    }
    mainMapping.value.forEach((m) => {
      mapping.value.forEach((url) => {
        url = m + url;
        Object.keys(mapping.method).forEach((method) => {
          const path = (paths[url] = {}) as OperationPathMap;
          path[method.toLowerCase()] = operationDoc;
        });
      })
    })
  }

  /**
   * 构建api接口操作参数
   * @param operation 
   */
  private static buildOperationParameters(operation: ApiOperationMeta) {
    operation.parameters.forEach((parameter) => {
      const dataType = parameter.type;
      const model = definitions[dataType];
      if (dataType === 'file') {
        operation.consumes = ['multipart/form-data'];
      }
      parameter.type = model ? undefined : dataType || 'string',
        parameter.schema = {
          $ref: model ? '#/definitions/' + dataType : undefined,
        }
    });
    return operation.parameters;
  }
}

/**
 * 内部热更新 
 */
hot.create(module).preload((old) => {
  // 预更新时，判断当前模块是否为被修饰的类
  const info = old.exports.default || old.exports;
  if (typeof info !== 'function') {
    return;
  }
  const api = apiMetaList.find((api) => api.class === info);
  if (api) {
    const index = apiMetaList.indexOf(api);
    console.log('find inddex',index);
    apiMetaList.splice(index, 1);
  }
  // 删除schema
  delete definitions[info.name];
})