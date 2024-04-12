import AbstractPointcutAdvisor from "./AbstractPointcutAdvisor";
import Advice from "../advice/Advice";
import Pointcut from "../pointcut/Pointcut";

export default class DefaultPointcutAdvisor extends AbstractPointcutAdvisor {

  private advice: Advice;

  private pointcut: Pointcut = Pointcut.TRUE;

  setAdvice(advice: Advice) {
    this.advice = advice;
  }

  getAdvice(): Advice {
    return this.advice;
  }

  setPointcut(pointcut: Pointcut) {
    this.pointcut = pointcut;
  }

  getPointcut(): Pointcut {
    return this.pointcut;
  }
}