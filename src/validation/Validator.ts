import ValidationContext from "./ValidationContext";

export default interface Validator {
  /**
   * 验证指定值是否合法
   *
   * @param value 当前值
   * @param context 当前验证上下文
   */
  validate(value: any, context: ValidationContext): Promise<boolean> | boolean
}