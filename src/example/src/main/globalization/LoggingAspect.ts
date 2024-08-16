import { Aspect, Component, JoinPoint, After, AfterReturning, AfterThrowing, Before } from 'node-web-mvc';
import HomeController from '../controllers/HomeController';

@Aspect
@Component
export default class LoggingAspect {
  @Before((clazz, method) => clazz == HomeController)
  loggingBefore(joinPint: JoinPoint) {
    console.log('===> 1. AOP Aspect: loggingBefore ', joinPint.getSignature(), '<<Arguments>>====>', joinPint.getArgs());
  }

  @AfterReturning((clazz, method) => clazz == HomeController)
  loggingAfterReturning(joinPint: JoinPoint, value: object) {
    console.log('===> 2. AOP Aspect: logginAfterReturning ', joinPint.getSignature(), '<<Return Value>>===> ', value);
  }

  @After((clazz, method) => clazz == HomeController)
  loggingAfter(joinPint: JoinPoint) {
    console.log('===> 3. AOP Aspect: loggingAfter ', joinPint.getSignature());
  }

  @AfterThrowing((clazz, method) => clazz == HomeController)
  loggingAfterThrowing(joinPint: JoinPoint) {
    console.log('===> 4. AOP Aspect: loggingAfterThrowing ', joinPint.getSignature());
  }
}
