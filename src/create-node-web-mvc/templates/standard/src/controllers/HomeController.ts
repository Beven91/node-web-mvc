import { RestController, RequestMapping, GetMapping } from 'node-web-mvc';

@RestController
@RequestMapping('/home')
export default class HomeController {
  
  @GetMapping({ value: '/index' })
  index() {
    return 'Hello World';
  }
}
