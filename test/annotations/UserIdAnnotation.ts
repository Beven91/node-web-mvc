import { Target } from '../../src/index';

@Target
class UserId {
  constructor(){
    // 注解构造函数
  }
}

// 公布注解
export default Target.install(UserId);