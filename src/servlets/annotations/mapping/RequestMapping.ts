import hot from 'nodejs-hmr';
import RequestMappingInfo, { RouteMappingOptions } from '../../mapping/RequestMappingInfo';
import Target from '../Target';
import RuntimeAnnotation, { IAnnotationClazz } from '../annotation/RuntimeAnnotation';
import ElementType from '../annotation/ElementType';
import RequestMappingHandlerMapping from '../../mapping/RequestMappingHandlerMapping';

const remainingMappings = new Map<Function, Function>();

export class RequestMappingAnnotation extends RouteMappingOptions {

  mapping?: RequestMappingInfo

  constructor(meta: RuntimeAnnotation, value: RouteMappingOptions | string) {
    super();
    this.mapping = RequestMappingInfo.create(value, null);
    const { target } = meta;
    remainingMappings.set(meta.ctor, meta.ctor);
    if (meta.elementType === ElementType.TYPE) {
      remainingMappings.delete(meta.ctor);
      // 修饰控制器
      createRouteMappings(target, this.mapping);
    }
  }

  static initializeUnClassMappings() {
    for (let ctor of remainingMappings.values()) {
      createRouteMappings(ctor, RequestMappingInfo.create('', null))
    }
    remainingMappings.clear();
  }

  static getMappingInfo(beanType: Function, method?: string): RequestMappingInfo {
    let annotation: RuntimeAnnotation<RequestMappingAnnotation> = null;
    if (arguments.length === 1) {
      annotation = RuntimeAnnotation.getClassAnnotation(beanType, RequestMappingAnnotation);
    } else {
      annotation = RuntimeAnnotation.getMethodAnnotation(beanType, method, RequestMappingAnnotation);
    }
    if (!annotation) {
      return null;
    }
    return annotation.nativeAnnotation.mapping;
  }
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
export default Target([ElementType.TYPE, ElementType.METHOD])(RequestMappingAnnotation);

/**
 * 附加控制器类的请求映射
 * @param {*} target  当前控制器类
 * @param {*} mapping 配置的映射
 */
function createRouteMappings(target, controllerMapping: RequestMappingInfo) {
  const annotations = RuntimeAnnotation.getClassAnnotationsOf(target, RequestMappingAnnotation);
  annotations.forEach((annotation) => {
    const name = `@${target.name}/${annotation.name}`;
    const requestMapping = annotation.nativeAnnotation.mapping;
    const actionPaths = requestMapping.value || [];
    const controllerPaths = controllerMapping.value || [''];
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
    // 注册mapping
    RequestMappingHandlerMapping
      .getInstance()
      .registerHandlerMethod(name, requestMapping, target, annotation.method);
  })
}

hot
  .create(module)
  .postend(() => {
    RequestMappingAnnotation.initializeUnClassMappings();
  })