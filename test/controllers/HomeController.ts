
import { Controller, Api, ApiOperation, GetMapping, RequestMapping } from '../../src/index';

@Api({ description: '首页' })
@RequestMapping('/home')
export default class HomeController extends Controller {

  @ApiOperation({ value:'你好...' })
  @GetMapping('/index')
  index() {
    return 'home/index...';
  }
}