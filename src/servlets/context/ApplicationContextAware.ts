import Aware from '../../ioc/factory/Aware';
import type AbstractApplicationContext from './AbstractApplicationContext';

export default abstract class ApplicationContextAware extends Aware {
  abstract setApplication(context: AbstractApplicationContext): void;
}
