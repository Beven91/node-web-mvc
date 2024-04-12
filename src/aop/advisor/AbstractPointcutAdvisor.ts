import Ordered from "../../servlets/context/Ordered";
import PointcutAdvisor from "./PointcutAdvisor";

export default abstract class AbstractPointcutAdvisor extends PointcutAdvisor implements Ordered {

  private order: number

  setOrder(value: number) {
    this.order = value;
  }

  getOrder(): number {
    return this.order;
  }
}