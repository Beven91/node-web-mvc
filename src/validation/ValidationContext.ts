import { Typer } from '../interface/Javascript';
import RuntimeAnnotation from '../servlets/annotations/annotation/RuntimeAnnotation';
import IConstraints from './annotation/IConstraints';

export default class ValidationContext {
  /**
   * 当前验证的验证注解
   */
  current: RuntimeAnnotation<IConstraints>;

  /**
   * 当前验证的字段名
   */
  currentField: string;

  /**
   * 当前验证的字段类型
   */
  currentTyper: Typer;

  /**
   * 验证注解集合
   */
  public readonly constraints: RuntimeAnnotation<IConstraints>[];

  constructor(constraints: RuntimeAnnotation<IConstraints>[]) {
    this.constraints = constraints;
  }
}
