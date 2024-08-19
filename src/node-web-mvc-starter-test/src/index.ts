// import { GeneralResult, UserInfo } from './Order';
import { hot } from 'node-web-mvc';

import { GeneralResult } from './Order';

function RestController(target: object) {

}

function GetMapping(target: object, pr: any) {

}

@RestController
class HomeController {
  @GetMapping
  say(name: Array<string>) {
    return new GeneralResult<string>;
  }
}

hot.create(module)
  .accept(() => {

  });
