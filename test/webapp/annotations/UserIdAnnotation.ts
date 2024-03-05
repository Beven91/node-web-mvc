import { ElementType, Target } from '../../../src/index';

@Target(ElementType.PARAMETER)
class UserId {
  constructor(){
    // 注解构造函数
  }
}

// 公布注解
export default Target.install(UserId);