import Pointcut from '../pointcut/Pointcut';
import Advisor from './Advisor';

export default abstract class PointcutAdvisor extends Advisor {
  abstract getPointcut(): Pointcut;
}
