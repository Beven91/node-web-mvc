import Aware from "../../ioc/factory/Aware";
import AbstractApplicationContext from "./AbstractApplicationContext";

export default abstract class ApplicationContextAware extends Aware {

  abstract setApplication(context: AbstractApplicationContext): void

}