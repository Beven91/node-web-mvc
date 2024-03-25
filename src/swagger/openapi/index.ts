/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import { ApiImplicitParamOptions, SchemaMeta, ApiTag, ApiOperationResponseBody, ApiOperationParameter, SchemeRef, ApiModelPropertyInfo } from './declare';
import { ApiPaths, ApiOperationPaths } from './declare';
import Schemas from './schemas';
import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import RuntimeAnnotation from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ApiImplicitParams from '../annotations/ApiImplicitParams';
import ParamAnnotation from '../../servlets/annotations/params/ParamAnnotation';
import MultipartFile from '../../servlets/http/MultipartFile';
import ApiOperation from '../annotations/ApiOperation';
import ResourceHandlerRegistry from '../../servlets/resources/ResourceHandlerRegistry';
import Controller from '../../servlets/annotations/Controller';
import Api from '../annotations/Api';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import ApiIgnore from '../annotations/ApiIgnore';
import RequestMappingInfo from '../../servlets/mapping/RequestMappingInfo';
import ServletResponse from '../../servlets/annotations/params/ServletResponse';
import ServletRequest from '../../servlets/annotations/params/ServletRequest';

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
    const mapping = RequestMapping.getMappingInfo(action.ctor, action.methodName);
    if (!mapping) {
      return;
    }
    const returnType = apiOperation?.returnType || action.returnType;
    const code = apiOperation?.code || '200';
    const consumes = apiOperation?.consumes || mapping.consumes || [];
    const parameters = this.buildOperationParameters(action, definition);
    const operationDoc = {
      deprecated: false,
      operationId: action.methodName,
      tags: apiOperation?.tags || tags.map((tag) => tag.name),
      summary: apiOperation?.value,
      description: apiOperation?.notes,
      parameters: parameters.filter((m) => !this.isMultipartFile(m.schema)),
      requestBody: this.buildOperationConsumes(action, parameters, consumes),
      responses: {
        "201": { "description": "Created" },
        "401": { "description": "Unauthorized" },
        "403": { "description": "Forbidden" },
        "404": { "description": "Not Found" },
        [code]: {
          "description": "OK",
          "content": this.buildOperationProduces(returnType, mapping, definition)
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
  private buildOperationParameters(action: RuntimeAnnotation<InstanceType<typeof RequestMapping>>, definition: Schemas) {
    const operationAnno = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiOperation);
    const apiImplicitAnno = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiImplicitParams);
    const parameters = apiImplicitAnno?.nativeAnnotation?.parameters || [];
    const parameterNames = operationAnno?.parameters || [];
    const finalParameters = parameterNames.map((name, i) => {
      const parameter = (parameters.find((m) => m.name === name) || {}) as ApiImplicitParamOptions;
      const parameterAnno = RuntimeAnnotation.getMethodParamAnnotation(action.ctor, action.methodName, name, ParamAnnotation);
      const isRequest = !!RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ServletResponse);
      const isResponse = !!RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ServletRequest);
      const parameter2 = parameterAnno?.nativeAnnotation;
      if (isRequest || isResponse) {
        return;
      }
      return this.mapOperationParam({
        name: emptyOf(parameter.name, parameter2?.value) || name,
        value: emptyOf(parameter.value, parameter2?.value),
        required: emptyOf(parameter.required, parameter2?.required),
        dataType: emptyOf(parameter.dataType, parameterAnno?.dataType) || operationAnno.paramTypes[i],
        example: emptyOf(parameter.example, parameter2?.defaultValue),
        paramType: emptyOf(parameter.paramType, parameter2?.getParamAt()) || 'query',
        description: parameter.description || undefined
      });
    }).filter(Boolean);
    return finalParameters.map((parameter) => {
      const typeInfo = definition.typemappings.make(parameter.dataType || parameter.example?.constructor);
      if (parameter.in === 'body') return null;
      return {
        name: parameter.name,
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        example: emptyOf(parameter.example, undefined),
        schema: typeInfo
      } as ApiOperationParameter
    }).filter(Boolean);
  }

  private isMultipartFile(schema: ApiOperationParameter['schema']) {
    const ref = (schema as SchemeRef)?.$ref;
    const type = schema as ApiModelPropertyInfo;
    if (!type) {
      return false;
    } else if (ref) {
      return ref.indexOf('MultipartFile') > -1;
    } else {
      return type.type == 'file' || type.items?.type == 'file';
    }
  }

  private buildOperationConsumes(action: RuntimeAnnotation<InstanceType<typeof RequestMapping>>, parameters: ApiOperationParameter[], consumes: string[]) {
    const requestBody = { content: {} } as ApiOperationResponseBody;
    const body = parameters.find((m) => m.in == 'body');
    const multiparts = parameters.filter((m) => this.isMultipartFile(m.schema))
    if (multiparts.length > 0) {
      const meta = requestBody.content['multipart/form-data'] = {
        schema: {
          required: multiparts.filter((m) => m.required).map((m) => m.name),
          properties: {},
          type: 'object'
        }
      }
      multiparts.forEach((m) => {
        meta.schema.properties[m.name] = {
          ...m.schema,
        }
      })
    }
    if (body && (body.schema as SchemeRef)?.$ref) {
      requestBody.content['application/json'] = {
        schema: body.schema as SchemeRef
      }
    }
    consumes.forEach((m) => {
      if (requestBody.content[m]) return;
      requestBody.content[m] = {
        schema: {
          type: 'string'
        }
      }
    })
    return requestBody;
  }

  private buildOperationProduces(returnType: any, mapping: RequestMappingInfo, definition: Schemas) {
    const produces = mapping.produces?.length < 1 ? ['*/*'] : mapping.produces;
    const contents = {};
    produces.forEach((name) => {
      const schema = returnType ? definition.typemappings.make(returnType) : undefined;
      contents[name] = {
        schema: schema || { type: 'string' }
      }
    })
    return Object.keys(contents).length < 1 ? undefined : contents;
  }
}