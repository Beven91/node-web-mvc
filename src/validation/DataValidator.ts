import MethodArgumentNotValidException from "../errors/MethodArgumentNotValidException";
import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import MethodParameter from "../servlets/method/MethodParameter";
import Constraints from "./annotation/Constraints";
import Valid from "./annotation/Valid";
import Validated from "./annotation/Validated";

export default class DataValidator {

  /**
   * 获取配置在当前参数作用于上的验证注解
   * @param parameter 
   * @returns 
   */
  private getValidateAnnotation(parameter: MethodParameter) {
    const annotations = parameter.getParameterAnnotations();
    return annotations.find(annotation => {
      return RuntimeAnnotation.isAnnotationTypeOf(annotation, Valid) || RuntimeAnnotation.isAnnotationTypeOf(annotation, Validated);
    })?.nativeAnnotation as InstanceType<typeof Validated>;
  }

  determineValidationHints(anno: InstanceType<typeof Validated>) {
    const value = anno.value;
    return value instanceof Array ? value : [value].filter(Boolean);
  }

  async validate(value: object, parameter: MethodParameter) {
    if (value === null || value === undefined) return;
    // 获取参数上的校验注解
    const validAnnotation = this.getValidateAnnotation(parameter);
    if (!validAnnotation) {
      // 如果没有配置，则直接跳过校验
      return;
    }
    // 查找分组规则
    const groups = this.determineValidationHints(validAnnotation);
    // 当前校验目标对象类型
    const targetType = value.constructor;
    const constraints = Constraints.getConstraints(targetType, groups);
    if (constraints.length < 1) {
      // 如果没有配置任何规则
      return null;
    }
    // 按照约束校验
    for (const anno of constraints) {
      const content = value[anno.name];
      const constraint = anno.nativeAnnotation;
      const isValid = await constraint.validate(content, anno.dataType);
      if (isValid) {
        // 如果校验通过，则跳过
        continue;
      }
      throw new MethodArgumentNotValidException(parameter, constraint);
    }
  }
}