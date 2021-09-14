/**
 * @module CrossOrigin
 * @description  用于标注单个接口跨域
 */
 import Target from '../annotations/Target';
 import RuntimeAnnotation from '../annotations/annotation/RuntimeAnnotation';
 
 @Target
 class CrossOrigin {
 
   constructor(meta: RuntimeAnnotation) {
   }
 }
 
 /**
  * 从请求path中提取指定名称的参数值
  * 
  *  action(@PathVariable id)
  * 
  *  action(@PathVariable({ required: true }) id) 
  */
 export default Target.install<typeof CrossOrigin>(CrossOrigin);