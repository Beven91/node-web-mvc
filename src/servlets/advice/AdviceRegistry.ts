/**
 * @module AdviceRegistry
 * @description 控制器相关建议注册表
 */
import RuntimeAnnotation, { AnnotationFunction } from "../annotations/annotation/RuntimeAnnotation";
import ExceptionHandler, { ExceptionHandlerAnnotation } from '../annotations/ExceptionHandler';
import hot from 'nodejs-hmr';

const runtime = {
  Advice: null,
  controllerAdviceInstance: null
}

export default class AdviceRegistry {
  // 设定全局控制器处理实例
  static register(Advice) {
    // const instance = runtime.controllerAdviceInstance;
    // if (instance) {
    //   throw new Error('There has multiple @ControllerAdvice @' + instance.constructor.name + ' @' + Advice.name);
    // }
    runtime.Advice = Advice;
    runtime.controllerAdviceInstance = new Advice();
  }

  // 获取设置的controlleradvice
  static get controllerAdviceInstance() {
    return runtime.controllerAdviceInstance;
  }

  /**
   * 获取注册的异常处理函数
   */
  static getExceptionHandler() {
    const instance = runtime.controllerAdviceInstance;
    const anno = this.getAnnotation<ExceptionHandlerAnnotation>(ExceptionHandler);
    const handler = anno ? anno.handleException : null;
    return handler ? (...params) => handler.call(instance, ...params) : null;
  }

  /**
   * 获取当前方法上的指定注解信息
   * @param { Annotation } ctor 要获取的注解类型类
   */
  static getAnnotation<T>(ctor: AnnotationFunction<any> | RuntimeAnnotation) {
    if (!runtime.Advice) {
      return null;
    }
    const annotations = RuntimeAnnotation.getClassAllAnnotations(runtime.Advice);
    return RuntimeAnnotation.getNativeAnnotation<T>(annotations, ctor);
  }
}

hot.create(module).preend((old) => {
  const type = old.exports.default || old.exports;
  if (runtime.Advice === type) {
    runtime.Advice = null;
    runtime.controllerAdviceInstance = null;
  }
})