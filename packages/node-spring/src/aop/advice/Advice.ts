import RequestMapping from '../../servlets/annotations/mapping/RequestMapping';
import RestController from '../../servlets/annotations/RestController';

export default abstract class Advice {

}


class C {

}

@RestController
class A {
  @RequestMapping
  async say(): Promise<C> {
    return new C();
  }
}

console.log(A);
