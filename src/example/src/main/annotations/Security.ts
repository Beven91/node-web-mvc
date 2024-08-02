import { ElementType, Target } from 'node-web-mvc';

class Security {
}

// 公布注解
export default Target([ ElementType.TYPE, ElementType.METHOD ])(Security);
