// import { GeneralResult, UserInfo } from './Order';

function RestController(target: object) {

}

function GetMapping(target: object, pr: any) {

}

@RestController
class HomeController {
  @GetMapping
  say(name: Array<string>): Array<string> {
    return null;
  }
}
