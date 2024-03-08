import { ElementType, Target } from '../../../src/index';

class Security {
  constructor() {
    // 注解构造函数
  }
}

// 公布注解
export default Target([ElementType.TYPE, ElementType.METHOD])(Security);