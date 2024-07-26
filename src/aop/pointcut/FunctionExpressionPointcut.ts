import { ClazzType } from '../../interface/declare';
import Method from '../../interface/Method';
import Pointcut from './Pointcut';


export default class FunctionExpressionPointcut extends Pointcut {
  private expression: FunctionExpressionPointcut['matches'];

  setExpression(expression: FunctionExpressionPointcut['matches']) {
    this.expression = expression;
  }

  matches(clazz: ClazzType, method: Method): boolean {
    return this.expression?.(clazz, method);
  }
}
