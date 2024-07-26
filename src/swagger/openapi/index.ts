/**
 * @module OpenApiModel
 * @description 用于构建当前环境的openapi.json
 */
import path from 'path';
import { ApiImplicitParamOptions, ApiTag, ApiOperationResponseBody, ApiOperationParameter, SchemeRef, ApiModelPropertyInfo } from './declare';
import { ApiPaths, ApiOperationPaths } from './declare';
import Schemas from './schemas';
import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import RuntimeAnnotation, { } from '../../servlets/annotations/annotation/RuntimeAnnotation';
import ApiImplicitParams from '../annotations/ApiImplicitParams';
import ParamAnnotation from '../../servlets/annotations/params/ParamAnnotation';
import ApiOperation from '../annotations/ApiOperation';
import ResourceHandlerRegistry from '../../servlets/resources/ResourceHandlerRegistry';
import Controller from '../../servlets/annotations/Controller';
import Api from '../annotations/Api';
import ElementType from '../../servlets/annotations/annotation/ElementType';
import ApiIgnore from '../annotations/ApiIgnore';
import RequestMappingInfo from '../../servlets/mapping/RequestMappingInfo';
import ServletResponse from '../../servlets/annotations/params/ServletResponse';
import ServletRequest from '../../servlets/annotations/params/ServletRequest';
import Javascript from '../../interface/Javascript';
import HttpEntity from '../../servlets/models/HttpEntity';

const emptyOf = (v, defaultValue) => (v === null || v === undefined || v === '') ? defaultValue : v;

export default class OpenApiModel {
  /**
   * 初始化swagger文档配置
   */
  static initializeResource(registry: ResourceHandlerRegistry, enable: boolean) {
    if (!enable) return;
    // 如果使用swagger
    const swaggerLocation = path.join(__dirname, '../../../swagger-ui/');
    registry
      .addResourceHandler('/swagger-ui/**')
      .addResourceLocations(swaggerLocation)
      .setCacheControl({ maxAge: 0 });
  }

  static initializeApi(enable: boolean) {
    if (!enable) return;
    // 加载swagger-controller
    require('../controllers/SwaggerController');
  }

  /**
   * 驼峰命名转换成 - 符号链接
   */
  clampToJoinName(name: string) {
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
   * 将 -转换成小驼峰命名
   */
  toClamp(name: string) {
    const segments = name.split('-');
    return segments.map((m, i)=>{
      if (i === 0) {
        return m[0].toLowerCase() + m.slice(1);
      }
      return m[0].toUpperCase() + m.slice(1);
    }).join('');
  }

  createTags(annotation: RuntimeAnnotation<typeof Controller>) {
    const apiAnno = RuntimeAnnotation.getClassAnnotation(annotation.ctor, Api)?.nativeAnnotation;
    const name = this.clampToJoinName(annotation.ctor.name);
    return (apiAnno?.tags || [ {
      name: name,
      description: apiAnno?.description || name,
      externalDocs: apiAnno?.externalDocs,
    } ]);
  }

  /**
   * 获取完整的swaager openapi.json
   */
  build(contextPath: string) {
    const operationIds = {} as object;
    const id = require.resolve(path.resolve('package.json'));
    delete require.cache[id];
    // TODO: 如果要支持mjs场景这里需要考虑如何改造
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require(id);
    const tags: ApiTag[] = [];
    const paths: ApiPaths = {};
    const contributor = (pkg.contributors || [])[0] || {};
    const controllers = RuntimeAnnotation.getAnnotations(Controller);
    const definition = new Schemas();
    for (const controller of controllers) {
      if (RuntimeAnnotation.hasClassAnnotation(controller.ctor, ApiIgnore)) {
        // 如果忽略该控制器
        continue;
      }
      // 创建tags
      const controllerTags = this.createTags(controller);
      const actions = RuntimeAnnotation.getAnnotations(RequestMapping, controller.ctor).filter((m) => m.elementType === ElementType.METHOD);
      for (const action of actions) {
        // 构建操作
        this.buildOperation(paths, action, controllerTags, definition, operationIds);
      }
      tags.push(...controllerTags);
    }
    return {
      info: {
        'contact': {
          email: pkg.author || contributor.email || '',
        },
        'license': {
          'name': 'Apache 2.0',
          'url': 'http://www.apache.org/licenses/LICENSE-2.0.html',
        },
        'title': pkg.name,
        'version': pkg.version,
        'description': pkg.description || '',
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
      servers: [
        { url: contextPath },
      ],
      components: {
        schemas: definition.build(),
      },
      openapi: '3.0.1',
    };
  }

  /**
   * 创建api操作的所有paths
   */
  private buildOperation(paths: ApiPaths, action: RuntimeAnnotation<typeof RequestMapping>, tags: ApiTag[], definition: Schemas, operationIds: object) {
    const apiOperation = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiOperation)?.nativeAnnotation;
    const mapping = RequestMapping.getMappingInfo(action.ctor, action.methodName);
    if (!mapping) {
      return;
    }
    const utags = apiOperation?.tags || tags.map((tag) => tag.name);
    let operationId = action.methodName;
    if (operationIds[operationId]) {
      operationId = this.toClamp(`${utags[0]}-${operationId}`);
    }
    operationIds[action.methodName] = true;
    const returnType = apiOperation?.returnType || action.returnType;
    const code = apiOperation?.code || '200';
    const consumes = apiOperation?.consumes || mapping.consumes || [];
    const parameters = this.buildOperationParameters(action, definition);
    const operationDoc = {
      deprecated: false,
      operationId: operationId,
      tags: utags,
      summary: apiOperation?.value,
      description: apiOperation?.notes,
      parameters: parameters.filter((m) => this.isNotBodyParameter(m)),
      requestBody: this.buildOperationConsumes(action, parameters, consumes),
      responses: {
        '201': { 'description': 'Created' },
        '401': { 'description': 'Unauthorized' },
        '403': { 'description': 'Forbidden' },
        '404': { 'description': 'Not Found' },
        [code]: {
          'description': 'OK',
          'content': this.buildOperationProduces(returnType, mapping, definition),
        },
      },
    };
    mapping.value.forEach((url) => {
      Object.keys(mapping.method).forEach((method) => {
        const path = (paths[url] = paths[url] || {}) as ApiOperationPaths;
        path[method.toLowerCase()] = operationDoc;
      });
    });
  }

  private isNotBodyParameter(m: ApiOperationParameter) {
    const paramIn = m.in as string;
    return !this.isMultipartFile(m.schema) && paramIn !== 'body' && paramIn !== 'part';
  }

  /**
   * 构建api接口操作参数
   * @param operation
   */
  private buildOperationParameters(action: RuntimeAnnotation<typeof RequestMapping>, definition: Schemas) {
    const operationAnno = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiOperation);
    const apiImplicitAnno = RuntimeAnnotation.getMethodAnnotation(action.ctor, action.methodName, ApiImplicitParams);
    const parameters = apiImplicitAnno?.nativeAnnotation?.parameters || [];
    const parameterNames = action.parameters;
    const paramTypes = action.paramTypes;
    const finalParameters = parameterNames.map((name, i) => {
      const parameter = (parameters.find((m) => m.name === name) || {}) as ApiImplicitParamOptions;
      const parameterAnno = RuntimeAnnotation.getMethodParamAnnotation(action.ctor, action.methodName, name, ParamAnnotation);
      const isRequest = !!RuntimeAnnotation.getMethodParamAnnotation(action.ctor, action.methodName, name, ServletRequest);
      const isResponse = !!RuntimeAnnotation.getMethodParamAnnotation(action.ctor, action.methodName, name, ServletResponse);
      const parameter2 = parameterAnno?.nativeAnnotation;
      const dataType = emptyOf(parameter.dataType, parameterAnno?.dataType) || paramTypes[i] || operationAnno?.paramTypes?.[i];
      if (isRequest || isResponse || Javascript.createTyper(dataType).isType(HttpEntity)) {
        return;
      }
      const value = emptyOf(parameter.value, parameter2?.value) || emptyOf(parameter.name, parameter2?.value) || name;
      const useType = parameter2?.paramAt;
      return {
        name: value || name,
        required: emptyOf(parameter.required, parameter2?.required),
        example: emptyOf(parameter.example, parameter2?.defaultValue),
        description: parameter.description || undefined,
        in: useType || 'query',
        dataType: dataType,
        type: '',
        schema: {
          $ref: null,
        },
      };
    }).filter(Boolean);
    return finalParameters.map((parameter) => {
      const typeInfo = definition.typemappings.make(parameter.dataType || parameter.example?.constructor);
      return {
        name: parameter.name,
        required: parameter.required,
        description: parameter.description,
        in: parameter.in,
        example: emptyOf(parameter.example, undefined),
        schema: typeInfo,
      } as ApiOperationParameter;
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

  private buildOperationConsumes(action: RuntimeAnnotation<typeof RequestMapping>, parameters: ApiOperationParameter[], consumes: string[]) {
    const requestBody = { content: {} } as ApiOperationResponseBody;
    const body = parameters.find((m) => m.in == 'body');
    const multiparts = parameters.filter((m) => this.isMultipartFile(m.schema) || (m.in as string) == 'part');
    if (multiparts.length > 0) {
      const meta = requestBody.content['multipart/form-data'] = {
        schema: {
          required: multiparts.filter((m) => m.required).map((m) => m.name),
          properties: {},
          type: 'object',
        },
      };
      multiparts.forEach((m) => {
        meta.schema.properties[m.name] = {
          ...m.schema,
        };
      });
    }
    if (body) {
      requestBody.content['application/json'] = {
        example: emptyOf(body.example, undefined),
        schema: body.schema as SchemeRef,
      };
    }
    consumes.forEach((m) => {
      if (requestBody.content[m]) return;
      requestBody.content[m] = {
        schema: {
          type: 'string',
        },
      };
    });
    if (Object.keys(requestBody.content).length < 1) {
      return undefined;
    }
    return requestBody;
  }

  private buildOperationProduces(returnType: any, mapping: RequestMappingInfo, definition: Schemas) {
    const produces = mapping.produces?.length < 1 ? [ '*/*' ] : mapping.produces;
    const contents = {};
    produces.forEach((name) => {
      const schema = returnType ? definition.typemappings.make(returnType) : undefined;
      contents[name] = {
        schema: schema || { type: 'string' },
      };
    });
    return Object.keys(contents).length < 1 ? undefined : contents;
  }
}
