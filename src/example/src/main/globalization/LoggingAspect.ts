import { Aspect, Component, JoinPoint, After, AfterReturning, AfterThrowing, Before } from 'node-web-mvc';
import HomeController from '../controllers/HomeController';

@Aspect
@Component
export default class LoggingAspect {
  @Before((clazz, method) => clazz == HomeController)
  loggingBefore(joinPint: JoinPoint) {
    console.log('===> AOP Aspect: loggingBefore ', joinPint.getSignature(), '<<Arguments>>====>', joinPint.getArgs());
  }

  @After((clazz, method) => clazz == HomeController)
  loggingAfter(joinPint: JoinPoint) {
    console.log('===> AOP Aspect: loggingAfter ', joinPint.getSignature());
  }

  @AfterReturning((clazz, method) => clazz == HomeController)
  loggingAfterReturning(joinPint: JoinPoint, value: object) {
    console.log('===> AOP Aspect: logginAfterReturning ', joinPint.getSignature(), '<<Return Value>>===> ', value);
  }

  @AfterThrowing((clazz, method) => clazz == HomeController)
  loggingAfterThrowing(joinPint: JoinPoint) {
    console.log('===> AOP Aspect: loggingAfterThrowing ', joinPint.getSignature());
  }
}
