import { ElementType, Target } from '../../../src/index';

class UserId {
  constructor(){
    // 注解构造函数
  }
}

// 公布注解
export default Target(ElementType.PARAMETER)(UserId);