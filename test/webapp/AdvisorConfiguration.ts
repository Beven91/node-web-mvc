import { Bean, Configuration, Controller, DefaultPointcutAdvisor, FunctionExpressionPointcut, RuntimeAnnotation } from "../../src";
import LogMethodInterceptor from "./globalization/LogMethodInterceptor";


@Configuration
export default class AdvisorConfiguration {

  @Bean
  getMethodInterceptor() {
    const functionPointcut = new FunctionExpressionPointcut();
    const advisor = new DefaultPointcutAdvisor();

    functionPointcut.setExpression((clazz) => {
      return !!RuntimeAnnotation.getAnnotation(Controller, clazz);
    })
    advisor.setPointcut(functionPointcut);
    advisor.setAdvice(new LogMethodInterceptor());

    return advisor;
  }

}