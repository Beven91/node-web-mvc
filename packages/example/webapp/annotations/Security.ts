import { ElementType, Target } from '../../../src/index';

class Security {
}

// 公布注解
export default Target([ ElementType.TYPE, ElementType.METHOD ])(Security);
