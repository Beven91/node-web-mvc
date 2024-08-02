import { Bean, Configuration, Controller, DefaultPointcutAdvisor, FunctionExpressionPointcut, RuntimeAnnotation } from 'node-web-mvc';
import LogMethodInterceptor from './globalization/LogMethodInterceptor';


@Configuration
export default class AdvisorConfiguration {
  @Bean
  logMethodInterceptor() {
    const functionPointcut = new FunctionExpressionPointcut();
    const advisor = new DefaultPointcutAdvisor();

    functionPointcut.setExpression((clazz) => {
      return !!RuntimeAnnotation.getAnnotation(Controller, clazz) && clazz.name !== 'SwaggerController';
    });
    advisor.setPointcut(functionPointcut);
    advisor.setAdvice(new LogMethodInterceptor());

    return advisor;
  }
}
