import ElementType from '../../servlets/annotations/annotation/ElementType';
import Target from '../../servlets/annotations/Target';
import Pointcut from '../pointcut/Pointcut';

class Aspect {
  value?: Pointcut['matches'];
}

export default Target([ ElementType.TYPE ])(Aspect);
