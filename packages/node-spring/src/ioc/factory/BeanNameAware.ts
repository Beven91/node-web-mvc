import Aware from './Aware';

export default abstract class BeanNameAware extends Aware {
  abstract setBeanName(name: string)
}
