import AbstractApplicationContext from "./AbstractApplicationContext";

export default abstract class ApplicationContextAware {

  abstract setApplication(context: AbstractApplicationContext): void

}