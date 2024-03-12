import hot from 'nodejs-hmr';
import RequestMappingInfo, { ensureArrayPaths } from '../../mapping/RequestMappingInfo';
import Target from '../Target';
import RuntimeAnnotation, { TracerConstructor } from '../annotation/RuntimeAnnotation';
import ElementType from '../annotation/ElementType';
import RequestMappingHandlerMapping from '../../mapping/RequestMappingHandlerMapping';
import { HttpMethodKeys } from '../../http/HttpMethod';
import RestController from '../RestController';

export class RequestMapping {
  /**
   * 当前路由路径值
   */
  value: string | string[]

  /**string
   * 当前路由能处理的Http请求类型
   */
  method?: HttpMethodKeys | HttpMethodKeys[]

  /**
   * 当前路由设置的返回内容类型
   */
  produces?: string

  /**
   * 当前路由能接受的内容类型
   */
  consumes?: string | string[]

  /**
   * 当前路由需要的请求头信息
   */
  headers?: Map<string, string>

  /**
   * 当前路由需要的请求参数
   */
  params?: Map<string, any>

  static getMappingInfo(clazz: Function, method: string) {
    const anno = RuntimeAnnotation.getMethodAnnotation(clazz, method, RequestMapping);
    return (anno?.nativeAnnotation as RequestMappingExt)?.mapping;
  }
}

export interface RequestMappingExt {
  mapping?: RequestMappingInfo
}

/**
 * 映射指定控制器以及控制器下的函数的请求路径
 * 例如：  
 * 
 *    @RequestMapping('/user/')
 *    @RequestMapping(['/user','/hello'],'GET')
 *    @RequestMapping('/user','POST','application/json')
 *    RequestMapping({ value:'/user',method:'POST',produces:'application/json',consumes:''  })
 * @param {String/Object/Array} value 可以为对象，或者为path的字符串数组 '/user'  ['/user' ] { value:'xxx',method:'' }
 */
export default Target([ElementType.TYPE, ElementType.METHOD])(RequestMapping);

function registerAnnotationMappings(annotation: RuntimeAnnotation<RequestMapping>) {
  const target = annotation.ctor;
  const name = `@${target.name}/${annotation.name}`;
  const anno = annotation.nativeAnnotation;
  const controllerAnno = RuntimeAnnotation.getClassAnnotation(target, RequestMapping)?.nativeAnnotation;
  const restAnno = RuntimeAnnotation.getClassAnnotation(target, RestController);
  const produces = anno.produces || (restAnno ? 'application/json;charset=utf-8' : '') || controllerAnno?.produces || '';
  const requestMapping = new RequestMappingInfo(anno.value, anno.method, produces, anno.params, anno.headers, anno.consumes);
  const actionPaths = requestMapping.value || [];
  const controllerPaths = ensureArrayPaths(controllerAnno?.value || '');
  const values = [];
  if (controllerPaths.length > 0) {
    // 合并controller路由
    controllerPaths.forEach((controllerPath) => {
      actionPaths.map((actionPath) => {
        const exp = (controllerPath + '/' + actionPath).replace(/\/{2,3}/, '/');
        values.push(exp);
      })
    });
    requestMapping.value = values;
  }
  // 覆盖为标准的produces
  (anno as RequestMappingExt).mapping = requestMapping;
  // 注册mapping
  RequestMappingHandlerMapping
    .getInstance()
    .registerHandlerMethod(name, requestMapping, target, annotation.method);
}

export function registerAllAnnotationMappings() {
  const annotations = RuntimeAnnotation.getTypedRuntimeAnnotations(RequestMapping);
  annotations.forEach((annotation) => {
    registerAnnotationMappings(annotation);
  })
}

hot
  .create(module)
  .preload((old) => {
    const file = old.filename;
    const registration = RequestMappingHandlerMapping.getInstance().getRegistration();
    const removeList = [] as any[];
    for (let element of registration.values()) {
      const ctor = element.getHandlerMethod()?.beanType as TracerConstructor;
      if (ctor?.tracer?.isDependency(file)) {
        removeList.push(element.getMapping());
      }
    }
    removeList.forEach((item) => registration.delete(item));
  })
  .postend((latest) => {
    const file = latest.filename;
    const annotations = RuntimeAnnotation.getTypedRuntimeAnnotations(RequestMapping);
    annotations.forEach((annotation) => {
      const ctor = annotation.ctor as TracerConstructor;
      if (ctor.tracer?.isDependency(file)) {
        registerAnnotationMappings(annotation);
      }
    });
  })