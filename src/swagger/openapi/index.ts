/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import { ApiImplicitParamOptions, SchemaMeta, ApiTag, ApiOperationResponseBody } from './declare';
import { ApiPaths, ApiOperationPaths } from './declare';
import Schemas from './schemas';
import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ApiImplicitParams from '../annotations/ApiImplicitParams';
import ParamAnnotation from '../../servlets/annotations/params/ParamAnnotation';
import MultipartFile from '../../servlets/http/MultipartFile';
import RestController from '../../servlets/annotations/RestController';
import ApiOperation from '../annotations/ApiOperation';
import ResourceHandlerRegistry from '../../servlets/resources/ResourceHandlerRegistry';
import Controller from '../../servlets/annotations/Controller';
import Api from '../annotations/Api';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import ApiIgnore from '../annotations/ApiIgnore';

const emptyOf = (v, defaultValue) => (v === null || v === undefined || v === '') ? defaultValue : v;

export default class OpenApiModel {
  /**
   * 初始化swagger文档配置
   */
  static initialize(registry: ResourceHandlerRegistry) {
    // 如果使用swagger
    const swaggerLocation = path.join(__dirname, '../../../swagger-ui/');
    registry
      .addResourceHandler('/swagger-ui/**')
      .addResourceLocations(swaggerLocation)
      .setCacheControl({ maxAge: 0 })
    // 加载swagger-controller
    require('../controllers/SwaggerController');
  }

  /**
  * 添加接口操作参数定义
  * @param { ApiOptions  } params 修饰的接口方法的参数配置
  * @param { Controller } ctor 修饰的控制器
  * @param { String } name 操作名称
  */
  mapOperationParams(params: Array<ApiImplicitParamOptions>) {
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
  mapOperationParam(param: ApiImplicitParamOptions) {
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
   * 驼峰命名转换成 - 符号链接
   */
  clampName(name) {
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

  createTags(annotation: RuntimeAnnotation<InstanceType<typeof Controller>>) {
    const apiAnno = RuntimeAnnotation.getClassAnnotation(annotation.ctor, Api)?.nativeAnnotation;
    const name = this.clampName(annotation.ctor.name);
    return (apiAnno?.tags || [{
      name: name,
      description: apiAnno?.description || name,
      externalDocs: apiAnno?.externalDocs
    }]);
  }

  /**
   * 获取完整的swaager openapi.json
   */
  build(contextPath: string) {
    const id = require.resolve(path.resolve('package.json'));
    delete require.cache[id];
    const pkg = require(id);
    const tags: ApiTag[] = [];
    const paths: ApiPaths = {};
    const contributor = (pkg.contributors || [])[0] || {};
    const controllers = RuntimeAnnotation.getAnnotations(Controller);
    const definition = new Schemas();
    for (let controller of controllers) {
      if (RuntimeAnnotation.hasClassAnnotation(controller.ctor, ApiIgnore)) {
        // 如果忽略该控制器
        continue;
      }
      // 创建tags
      const controllerTags = this.createTags(controller);
      const actions = RuntimeAnnotation.getAnnotations(RequestMapping, controller.ctor).filter((m) => m.elementType === ElementType.METHOD);
      for (let action of actions) {
        // 构建操作
        this.buildOperation(paths, action, controllerTags, definition);
      }
      tags.push(...controllerTags);
    }
    return {
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
      tags: tags.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        } else if (a.name == b.name) {
          return 0;
        } else {
          return -1;
        }
      }),
      paths: paths,
      basePath: contextPath,
      // servers: [
      //   { url: WebMvcConfigurationSupport.configurer.contextPath || '/' }
      // ],
      components: {
        schemas: definition.build()
      },
      openapi: '3.0.1',
    };
  }

  /**
   * 创建api操作的所有paths
   */
  private buildOperation(paths: ApiPaths, action: RuntimeAnnotation<InstanceType<typeof RequestMapping>>, tags: ApiTag[], definition: Schemas) {
    const apiOperation = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiOperation)?.nativeAnnotation;
    const isRestController = !!RuntimeAnnotation.getClassAnnotation(action.ctor, RestController);
    const mapping = RequestMapping.getMappingInfo(action.ctor, action.methodName);
    if (!mapping) {
      return;
    }
    const code = apiOperation?.code || '200';
    const returnType = apiOperation?.returnType || action.returnType;
    const requestBody: ApiOperationResponseBody = { content: {} };
    const parameters = this.buildOperationParameters(action, requestBody, definition);
    const requestContents = Object.keys(requestBody.content).filter(Boolean);
    const consumes = requestContents.length > 0 ? requestBody : (isRestController ? ['application/json'] : '')
    const operationDoc = {
      consumes: mapping.consumes || consumes || apiOperation?.consumes || undefined,
      deprecated: false,
      operationId: action.methodName,
      tags: apiOperation?.tags || tags.map((tag) => tag.name),
      summary: apiOperation?.value,
      description: apiOperation?.notes,
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
              schema: returnType ? definition.typemappings.make(returnType) : undefined
            }
          },
        }
      }
    }
    mapping.value.forEach((url) => {
      Object.keys(mapping.method).forEach((method) => {
        const path = (paths[url] = paths[url] || {}) as ApiOperationPaths;
        path[method.toLowerCase()] = operationDoc;
      });
    })
  }

  /**
   * 构建api接口操作参数
   * @param operation 
   */
  private buildOperationParameters(action: RuntimeAnnotation<InstanceType<typeof RequestMapping>>, requestBody: ApiOperationResponseBody, definition: Schemas) {
    const operationAnno = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiOperation);
    const apiImplicitAnno = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiImplicitParams);
    const parameters = apiImplicitAnno?.nativeAnnotation?.parameters || [];
    const parameterNames = operationAnno?.parameters || [];
    const finalParameters = parameterNames.map((name, i) => {
      const parameter = (parameters.find((m) => m.name === name) || {}) as ApiImplicitParamOptions;
      const parameterAnno = RuntimeAnnotation.getMethodParamAnnotation(action.ctor, action.methodName, name, ParamAnnotation);
      const parameter2 = parameterAnno?.nativeAnnotation;
      return this.mapOperationParam({
        name: emptyOf(parameter.name, parameter2?.value) || name,
        value: emptyOf(parameter.value, parameter2?.value),
        required: emptyOf(parameter.required, parameter2?.required),
        dataType: emptyOf(parameter.dataType, parameterAnno?.dataType) || operationAnno.paramTypes[i],
        example: emptyOf(parameter.example, parameter2?.defaultValue),
        paramType: emptyOf(parameter.paramType, parameter2?.getParamAt()) || 'query',
        description: parameter.description || undefined
      });
    });
    return finalParameters.map((parameter) => {
      const typeInfo = definition.typemappings.make(parameter.dataType || parameter.example?.constructor);
      if (typeInfo.type === 'file' || (parameter.in as string) == 'part' || typeInfo?.items?.type == 'file') {
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
          ...typeInfo,
        }
        return null;
      } else if (parameter.in == 'body') {
        requestBody.content['application/json'] = {
          schema: typeInfo
        }
        return null;
      }
      return {
        name: parameter.name,
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        example: emptyOf(parameter.example, undefined),
        schema: typeInfo
      }
    }).filter(Boolean);
  }
}