/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import { ApiOptions, ApiOperationOptions, ApiImplicitParamOptions, ApiMeta, ApiOperationMeta, SchemaMeta } from './declare';
import { ApiModelOptions, ApiModelPropertyOptions, OperationsDoc, OperationPathMap } from './declare';
import hot from 'nodejs-hmr';
import Definition from './definition';
import { RequestMappingAnnotation } from '../../servlets/annotations/mapping/RequestMapping';
import WebMvcConfigurationSupport from '../../servlets/config/WebMvcConfigurationSupport';
import RuntimeAnnotation, { TracerConstructor } from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ApiImplicitParams from '../annotations/ApiImplicitParams';
import ParamAnnotation from '../../servlets/annotations/params/ParamAnnotation';
import MethodParameter from '../../interface/MethodParameter';
import MultipartFile from '../../servlets/http/MultipartFile';
import RestController from '../../servlets/annotations/RestController';
import ApiOperation from '../annotations/ApiOperation';

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
    let api = apiMetaList.find((api) => api.clazz === ctor);
    if (!api) {
      const name = this.clampName(ctor.name);
      api = { clazz: ctor, operations: [], option: { tags: [{ name: name }] } };
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
      definitions[name] = {
        title: '', description: '', properties: {}, ctor: ctor
      }
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
      name: param.value || param.name,
      required: param.required,
      example: param.example,
      description: param.description || param.value || undefined,
      in: param.dataType === MultipartFile ? 'formData' : param.paramType,
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
    const dataType = propertyOptions.dataType ? Definition.reflectTypeName(propertyOptions.dataType) : null;
    model.properties[name] = {
      generic: propertyOptions.generic || generic,
      description: propertyOptions.value,
      required: propertyOptions.required,
      example: propertyOptions.example,
      type: dataType || typeof (propertyOptions.example || ''),
      enum: !propertyOptions.enum ? undefined : Object.keys(propertyOptions.enum).filter((m: any) => isNaN(m))
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
    const contributor = (pkg.contributors || [])[0] || {};
    const documentation = {
      info: {
        contact: {
          email: pkg.author || contributor.email || ''
        },
        license: {
          name: pkg.license,
          url: pkg.licenseUrl || ''
        },
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
      components: {
        schemas: {}
      },
      openapi: '3.0.1',
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
    documentation.components.schemas = Definition.getFinalDefinitions();
    return documentation;
  }

  /**
   * 创建api操作的所有paths
   */
  private static buildOperation(paths, operation: ApiOperationMeta) {
    const option = operation.option;
    const api = operation.api;
    const isRestController = !!RuntimeAnnotation.getClassAnnotation(api.clazz, RestController);
    const topMapping = RequestMappingAnnotation.getMappingInfo(api.clazz);
    const mapping = RequestMappingAnnotation.getMappingInfo(api.clazz, operation.method);
    if (!mapping) {
      return;
    }
    const code = 'code' in option ? option.code : '200';
    const returnType = option.returnType;
    const model = Definition.getDefinition(returnType);
    const consumes = isRestController ? ['application/json'] : '';
    const parameters = this.buildOperationParameters(operation);
    const requestBody = operation.requestBody;
    const operationDoc = {
      consumes: mapping.consumes || topMapping?.consumes || consumes || operation.consumes || undefined,
      deprecated: false,
      operationId: operation.method,
      tags: api.option.tags.map((tag) => tag.name),
      summary: option.value,
      description: option.notes,
      parameters: parameters,
      requestBody: Object.keys(requestBody.content).length > 0 ? requestBody : undefined,
      responses: {
        "201": { "description": "Created" },
        "401": { "description": "Unauthorized" },
        "403": { "description": "Forbidden" },
        "404": { "description": "Not Found" },
        [code]: {
          "description": "OK",
          "content": {
            [mapping.produces || '*/*']: {
              schema: model.schema || (!returnType ? undefined : { type: returnType })
            }
          },
        }
      }
    }
    mapping.value.forEach((url) => {
      Object.keys(mapping.method).forEach((method) => {
        const path = (paths[url] = paths[url] || {}) as OperationPathMap;
        path[method.toLowerCase()] = operationDoc;
      });
    })
  }

  private static getOperationParameters(operation: ApiOperationMeta) {
    const { method } = operation;
    const ctor = operation.api.clazz;
    const operationAnno = RuntimeAnnotation.getMethodAnnotation(ctor, method, ApiOperation);
    const apiImplicitAnno = RuntimeAnnotation.getMethodAnnotation(ctor, method, ApiImplicitParams);
    const annotations = RuntimeAnnotation.getMethodParamAnnotations(ctor, method);
    const parameters2 = annotations.filter((m) => m.nativeAnnotation instanceof ParamAnnotation).map((m) => m.nativeAnnotation.param);
    const parameters = apiImplicitAnno?.nativeAnnotation?.parameters || [];
    const parameterNames = operationAnno.parameters || [];
    return parameterNames.map((name, i) => {
      const parameter = (parameters.find((m) => m.name === name) || {}) as ApiImplicitParamOptions;
      const parameter2 = (parameters2.find((m) => m.name === name) || {}) as MethodParameter;
      return this.mapOperationParam({
        name: emptyOf(parameter.name, parameter2.name) || name,
        value: emptyOf(parameter.value, parameter2.value),
        required: emptyOf(parameter.required, parameter2.required),
        dataType: emptyOf(parameter.dataType, parameter2.dataType) || operationAnno.paramTypes[i],
        example: emptyOf(parameter.example, parameter2.defaultValue),
        paramType: emptyOf(parameter.paramType, parameter2.paramType) || 'query',
        description: emptyOf(parameter.description, parameter2.desc) || undefined
      });
    });
  }

  /**
   * 构建api接口操作参数
   * @param operation 
   */
  private static buildOperationParameters(operation: ApiOperationMeta) {
    const parameters = this.getOperationParameters(operation);
    const requestBody = operation.requestBody = {
      content: {}
    }
    return parameters.map((parameter) => {
      const dataType = parameter.dataType ? Definition.reflectTypeName(parameter.dataType) : null;
      const model = Definition.getDefinition(emptyOf(dataType, parameter.example));
      const type = model.schema ? undefined : model.type || dataType || 'string';
      if (dataType === 'file' || (parameter.in as string) == 'part') {
        operation.consumes = ['multipart/form-data'];
        const info = requestBody.content['multipart/form-data'] = (requestBody.content['multipart/form-data'] || {
          schema: {
            required: [],
            properties: {},
            type: 'object'
          }
        }) as { schema: SchemaMeta };
        if (parameter.required) {
          info.schema.required.push(parameter.name);
        }
        info.schema.properties[parameter.name] = {
          description: parameter.description,
          type: type,
          format: model.format,
        }
        return null;
      } else if (parameter.in == 'body') {
        requestBody.content['application/json'] = {
          schema: model.schema || {
            type: type
          }
        }
        return null;
      }
      return {
        name: parameter.name,
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        collectionFormat: model.collectionFormat,
        format: model.format,
        example: emptyOf(parameter.example, undefined),
        schema: model.schema || {
          type: type,
          items: model.items,
        }
      }
    }).filter(Boolean)
  }
}

/**
 * 内部热更新 
 */
hot.create(module)
  .preload((old) => {
    const file = old.filename;
    // 预更新时，判断当前模块是否为被修饰的类
    const removeApis = apiMetaList.filter((api) => {
      const ctor = api.clazz as TracerConstructor;
      return ctor.tracer?.isDependency?.(file);
    });
    const removeDefinitions = Object.keys(definitions).filter((k) => {
      const ctor = definitions[k].ctor as TracerConstructor;
      return ctor.tracer?.isDependency?.(file);
    })
    removeApis.forEach((api) => {
      const index = apiMetaList.indexOf(api);
      apiMetaList.splice(index, 1);
    })
    removeDefinitions.forEach((key) => {
      // 删除schema
      delete definitions[key];
    })
  })