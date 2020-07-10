
import { Controller, Api, ApiOperation, GetMapping, RequestMapping, RequestParam, RequestHeader, ApiImplicitParams, RequestBody, PostMapping, PathVariable } from '../../src/index';

@Api({ description: '首页' })
@RequestMapping('/home')
export default class HomeController extends Controller {

  @ApiOperation({ value: '@RequestParam 测试' })
  @GetMapping('/index')
  @ApiImplicitParams([
    { value: '编号', paramType: 'query', name: 'id' }
  ])
  index(@RequestParam({ required: true }) id) {
    return 'home/index...' + id;
  }

  @ApiOperation({ value: '@RequestHeader头部' })
  @GetMapping('/header')
  header(@RequestHeader({ value: 'accept' }) type) {
    return 'home/index...' + type;
  }

  @ApiOperation({ value: '@RequestBody 测试' })
  @ApiImplicitParams([
    { value: '类型', paramType: 'body', name: 'type' }
  ])
  @PostMapping('/body')
  body(@RequestBody type) {
    return 'home/index...' + JSON.stringify(type);
  }

  @ApiOperation({ value: '@PathVariable 测试' })
  @GetMapping('/path/{id}')
  @ApiImplicitParams([
    { value: '编号', paramType: 'path', name: 'id' }
  ])
  path(@PathVariable id) {
    return 'home/index...' + id;
  }
}