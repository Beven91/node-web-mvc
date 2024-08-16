import { ElementType, Target } from 'node-web-mvc';

class UserId {
  required?: boolean = true;
}

// 公布注解
export default Target(ElementType.PARAMETER)(UserId);
