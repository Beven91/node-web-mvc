
import { Controller, Api, ApiOperation, GetMapping, RequestMapping, RequestParam, RequestHeader, ApiImplicitParams, RequestBody, PostMapping, PathVariable, Autowired } from '../../src/index';
import UserId from '../annotations/UserIdAnnotation';
import OrderService from '../services/OrderService';
import UserInfo from '../models/UserInfo';

@Api({ description: '首页' })
@RequestMapping('/home')
export default class HomeController extends Controller {

  @Autowired
  private orderService: OrderService;

  @ApiOperation({ value: '@RequestParam 测试' })
  @GetMapping('/index')
  @ApiImplicitParams([
    { value: '编号', paramType: 'query', name: 'id', required: true }
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
  body(@RequestBody user: UserInfo): UserInfo {
    return user;
  }

  @ApiOperation({ value: '@PathVariable 测试' })
  @GetMapping('/path/{id}')
  @ApiImplicitParams([
    { value: '编号', paramType: 'path', name: 'id' }
  ])
  path(@PathVariable id) {
    return 'home/index...' + id;
  }

  @ApiOperation({ value: '@UserId 测试' })
  @GetMapping('/userId')
  userId(@UserId id) {
    return 'userId...' + id;
  }

  @ApiOperation({ value: '数据返回', returnType: 'GeneralResult<List<UserInfo>>' })
  @GetMapping('/return')
  returnData() {

  }

  @ApiOperation({ value: '数据返回：属性泛型', returnType: 'GeneralResult<UserInfo>' })
  @GetMapping('/return2')
  returnData2() {

  }
}