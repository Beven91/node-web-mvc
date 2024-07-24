import { Aspect, Component, JoinPoint } from "../../../src";
import After from "../../../src/aop/annotations/After";
import AfterReturning from "../../../src/aop/annotations/AfterReturning";
import AfterThrowing from "../../../src/aop/annotations/AfterThrowing";
import Before from "../../../src/aop/annotations/Before";
import HomeController from "../controllers/HomeController";


@Aspect
@Component
export default class LoggingAspect {

  @Before((clazz, method) => clazz == HomeController)
  loggingBefore(joinPint: JoinPoint) {
    console.log('===> AOP Aspect: loggingBefore ', joinPint.getSignature());
  }

  @After((clazz, method) => clazz == HomeController)
  loggingAfter(joinPint: JoinPoint) {
    console.log('===> AOP Aspect: loggingAfter ', joinPint.getSignature());
  }

  @AfterReturning((clazz, method) => clazz == HomeController)
  loggingAfterReturning(joinPint: JoinPoint, value: object) {
    console.log('===> AOP Aspect: logginAfterReturning ', joinPint.getSignature(), value);
  }

  @AfterThrowing((clazz, method) => clazz == HomeController)
  loggingAfterThrowing(joinPint: JoinPoint) {
    console.log('===> AOP Aspect: loggingAfterThrowing ', joinPint.getSignature());
  }
}