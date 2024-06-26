import MethodArgumentNotValidException from "../errors/MethodArgumentNotValidException";
import Javascript from "../interface/Javascript";
import RuntimeAnnotation from "../servlets/annotations/annotation/RuntimeAnnotation";
import MethodParameter from "../servlets/method/MethodParameter";
import ValidationContext from "./ValidationContext";
import ValidationMessage from "./ValidationMessage";
import Constraints from "./annotation/Constraints";
import Valid from "./annotation/Valid";
import Validated from "./annotation/Validated";

const validationMessage = new ValidationMessage();

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

  async validate(model: object, parameter: MethodParameter) {
    if (model === null || model === undefined) return;
    // 获取参数上的校验注解
    const validAnnotation = this.getValidateAnnotation(parameter);
    return this.validateByAnnotation(model, validAnnotation, parameter);
  }

  async validateByAnnotation(model: object, validAnnotation: InstanceType<typeof Validated>, parameter: MethodParameter) {
    if (!validAnnotation) {
      // 如果没有配置，则直接跳过校验
      return;
    }
    // 查找分组规则
    const groups = this.determineValidationHints(validAnnotation);
    // 当前校验目标对象类型
    const targetType = model.constructor;
    const constraints = Constraints.getConstraints(targetType, groups);
    if (constraints.length < 1) {
      // 如果没有配置任何规则
      return null;
    }
    const context = new ValidationContext(constraints);
    // 按照约束校验
    for (const anno of constraints) {
      const value = model[anno.name];
      const constraint = anno.nativeAnnotation;
      context.current = anno;
      context.currentField = anno.name;
      context.currentTyper = Javascript.createTyper(anno.dataType);
      const isValid = await constraint.validate(value, context);
      if (!isValid) {
        const message = validationMessage.format(constraint);
        throw new MethodArgumentNotValidException(parameter, message, constraint);
      }
      const proeprtyValid = RuntimeAnnotation.getAnnotationsByAnno(anno, Valid)[0]?.nativeAnnotation;
      if (proeprtyValid) {
        // 如果配置了校验，则嵌套校验
        await this.validateByAnnotation(value, proeprtyValid, parameter);
      }
    }
  }
}