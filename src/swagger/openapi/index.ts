/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import { ApiOptions, ApiOperationOptions, ApiImplicitParamOptions, ApiMeta, ApiOperationMeta } from './declare';
import { ApiModelOptions, ApiModelPropertyOptions, OperationsDoc, OperationPathMap } from './declare';
import hot from 'nodejs-hmr';
import Definition from './definition';
import { RequestMappingAnnotation } from '../../servlets/annotations/mapping/RequestMapping';
import WebMvcConfigurationSupport from '../../servlets/config/WebMvcConfigurationSupport';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ApiImplicitParams, { ApiImplicitParamsAnnotation } from '../annotations/ApiImplicitParams';
import ParamAnnotation from '../../servlets/annotations/params/ParamAnnotation';
import MethodParameter from '../../interface/MethodParameter';
import MultipartFile from '../../servlets/http/MultipartFile';

const emptyOf = (v, defaultValue) => (v === null || v === undefined || v === '') ? defaultValue : v;

// 所有注册models
const definitions = Definition.definitions;

// 所有注册的接口
const apiMetaList = [] as Array<ApiMeta>

export default class OpenApiModel {
  /**
   * 初始化swagger文档配置
   */
  static initialize() {
    // 如果使用swagger
    const swaggerLocation = path.join(__dirname, '../../../swagger-ui/');
    WebMvcConfigurationSupport
      .configurer
      .resourceHandlerRegistry
      .addResourceHandler('/swagger-ui/**')
      .addResourceLocations(swaggerLocation)
      .setCacheControl({ maxAge: 0 })
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
      api = { class: ctor, operations: [], option: { tags: [{ name: name }] } };
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
      definitions[name] = { title: '', description: '', properties: {}, ctor: ctor }
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
    api.option.tags = (option.tags || [{
      name: name,
      description: option.description || name,
      externalDocs: option.externalDocs
    }])
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
  static mapOperationParams(params: Array<ApiImplicitParamOptions>) {
    params
      .filter((param) => !!param)
      .forEach((param) => this.mapOperationParam(param))
  }

  /**
   * 添加接口操作参数
   * @param { ApiImplicitParamOptions  } param 修饰的接口方法的参数配置
   * @param { Controller } ctor 修饰的控制器
   * @param { String } name 操作名称
   */
  static mapOperationParam(param: ApiImplicitParamOptions) {
    return {
      name: param.name,
      required: param.required,
      example: param.example,
      description: param.description || param.value,
      in: param.dataType === 'file' ? 'formData' : param.paramType,
      dataType: param.dataType,
      type: '',
      schema: {
        $ref: null,
      }
    }
  }

  /**
   * 添加实体类
   * @param { ApiModelOptions } modelOptions 修饰的实体类配置
   * @param { Constructor } ctor 修饰的实体类类
   */
  static addModel(modelOptions: ApiModelOptions, ctor) {
    const model = this.createApiModel(ctor);
    model.title = modelOptions.value;
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
    const generic = /<\d+>/.test(propertyOptions.dataType)
    model.properties[name] = {
      generic: propertyOptions.generic || generic,
      description: propertyOptions.value,
      required: propertyOptions.required,
      example: propertyOptions.example,
      type: propertyOptions.dataType || typeof (propertyOptions.example || '')
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
    const id = require.resolve(path.resolve('package.json'));
    delete require.cache[id];
    const pkg = require(id);
    // const contributor = (pkg.contributors || [])[0] || {};
    const documentation = {
      info: {
        // contact: {
        //   email: pkg.author || contributor.email || ''
        // },
        // license: {
        //   name: pkg.license,
        //   url:pkg.licenseUrl || ''
        // },
        title: pkg.name,
        version: pkg.version,
        description: pkg.description || ''
      },
      tags: [],
      paths: {} as OperationsDoc,
      basePath: WebMvcConfigurationSupport.configurer.contextPath,
      // servers: [
      //   { url: WebMvcConfigurationSupport.configurer.contextPath || '/' }
      // ],
      // components: {
      //   parameters: {},
      //   schemas: {}
      // },
      // openapi: '3.0.1',
      definitions: {},
      swagger: '2.0',
    };
    // 构建api
    apiMetaList.forEach((api) => {
      const paths = documentation.paths;
      // 构建tags
      documentation.tags = documentation.tags.concat(api.option.tags || []);
      // 构建paths
      api.operations.forEach((operation) => this.buildOperation(paths, operation));
    });
    // 最后清理definition
    documentation.definitions = Definition.getFinalDefinitions();
    return documentation;
  }

  /**
   * 创建api操作的所有paths
   */
  private static buildOperation(paths, operation: ApiOperationMeta) {
    const option = operation.option;
    const api = operation.api;
    const mapping = RequestMappingAnnotation.getMappingInfo(api.class, operation.method);
    if (!mapping) {
      return;
    }
    const code = 'code' in option ? option.code : '200';
    const returnType = option.returnType;
    const model = returnType ? Definition.getDefinitionModel(returnType) : Definition.getExampleDefinitionModel(option.example);
    const operationDoc = {
      consumes: mapping.consumes || operation.consumes || mapping.consumes,
      deprecated: false,
      operationId: operation.method,
      tags: api.option.tags.map((tag) => tag.name),
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
          "schema": model.schema,
        }
      }
    }
    mapping.value.forEach((url) => {
      Object.keys(mapping.method).forEach((method) => {
        const path = (paths[url] = {}) as OperationPathMap;
        path[method.toLowerCase()] = operationDoc;
      });
    })
  }

  private static getOperationParameters(operation: ApiOperationMeta) {
    const { method } = operation;
    const ctor = operation.api.class;
    const apiImplicitAnno = RuntimeAnnotation.getMethodAnnotation(ctor, method, ApiImplicitParams);
    const annotations = RuntimeAnnotation.getMethodParamAnnotations(ctor, method);
    const paramsAnnotation = (apiImplicitAnno ? apiImplicitAnno.nativeAnnotation : {}) as ApiImplicitParamsAnnotation;
    const parameters2 = annotations.filter((m) => m.nativeAnnotation instanceof ParamAnnotation).map((m) => m.nativeAnnotation.param);
    const parameters = paramsAnnotation.parameters || [];
    const parameterNames = parameters.length > parameters2.length ? parameters.map((p) => p.name) : parameters2.map((m) => m.name);
    return parameterNames.map((name) => {
      const parameter = (parameters.find((m) => m.name === name) || {}) as ApiImplicitParamOptions;
      const parameter2 = (parameters2.find((m) => m.name === name) || {}) as MethodParameter;
      const dataType = parameter2.dataType;
      const isFile = dataType === MultipartFile;
      const typeName = typeof dataType === 'function' ? dataType.name : emptyOf(dataType, 'string');
      return this.mapOperationParam({
        name: emptyOf(parameter.name, parameter2.name),
        value: emptyOf(parameter.value, parameter2.desc),
        required: emptyOf(parameter.required, parameter2.required),
        dataType: emptyOf(parameter.dataType, isFile ? 'file' : typeName),
        example: emptyOf(parameter.example, parameter2.defaultValue),
        paramType: emptyOf(parameter2.paramType, parameter.paramType),
        description: emptyOf(parameter.description, parameter2.desc)
      });
    });
  }

  /**
   * 构建api接口操作参数
   * @param operation 
   */
  private static buildOperationParameters(operation: ApiOperationMeta) {
    const parameters = this.getOperationParameters(operation);
    return parameters.map((parameter) => {
      const dataType = parameter.dataType;
      const model = dataType ? Definition.getDefinitionModel(dataType) : Definition.getDefinition2(parameter.example);
      if (dataType === 'file' && !operation.consumes) {
        operation.consumes = ['multipart/form-data'];
      }
      return {
        name: parameter.name,
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        type: model.schema ? undefined : model.type || dataType,
        items: model.items,
        schema: model.schema,
      }
    });
  }
}

/**
 * 内部热更新 
 */
hot.create(module)
  .preload((old) => {
    // 预更新时，判断当前模块是否为被修饰的类
    const info = old.exports.default || old.exports;
    if (typeof info !== 'function') {
      return;
    }
    const api = apiMetaList.find((api) => api.class === info);
    if (api) {
      const index = apiMetaList.indexOf(api);
      old.__apiIndex = index;
      apiMetaList.splice(index, 1);
    } else {
      const keys = Object.keys(definitions).filter((k) => definitions[k].ctor === info);
      keys.forEach((key) => {
        // 删除schema
        delete definitions[key];
      })
    }
  })
  .postend((now, old) => {
    const index = old.__apiIndex;
    if (isNaN(index)) {
      return;
    }
    if (apiMetaList.length > 0) {
      const last = apiMetaList.pop();
      const newApiList = [
        ...apiMetaList.slice(0, index),
        last,
        ...apiMetaList.slice(index)
      ]
      apiMetaList.length = 0;
      apiMetaList.push(...newApiList);
    }
  })