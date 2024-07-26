import { ElementType, Target } from '../../../src/index';

class UserId {
  required?: boolean = true;
}

// 公布注解
export default Target(ElementType.PARAMETER)(UserId);
