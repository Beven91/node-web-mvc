import Order from './Order';

function RestController(target: object) {

}

function GetMapping(target:object, pr:any) {

}


@RestController
class HomeController {
  @GetMapping
  say() : Order {
    return null;
  }
}
