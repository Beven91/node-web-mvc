
import { Api, ApiOperation, GetMapping, RequestMapping, RequestParam, RequestHeader, ApiImplicitParams, RequestBody, PostMapping, PathVariable, Autowired, MultipartFile } from '../../../src/index';
import UserId from '../annotations/UserIdAnnotation';
import OrderService from '../services/OrderService';
import { UserInfo } from '../models/';

@Api({ value:'首页' })
@RequestMapping('/home')
export default class HomeController {

  @Autowired
  private orderService: OrderService;

  @ApiOperation({ value: '@RequestParam 测试', example: 'string' })
  @GetMapping('/index')
  // @ApiImplicitParams([
  //   { description: '编号', paramType: 'query', name: 'id', required: true }
  // ])
  index(@RequestParam({ required: true }) id:string,@RequestParam file:MultipartFile) {
    this.orderService.sayHello();
    return 'home/index...' + id;
  }

  @ApiOperation({ value: '@RequestHeader头部' })
  @GetMapping('/header')
  header(@RequestHeader({ value: 'accept' }) type:string) {
    return 'home/index...' + type;
  }

  @ApiOperation({ value: '@RequestBody 测试' })
  @ApiImplicitParams([
    { description: '类型', paramType: 'body', name: 'user',example:{ name:1} }
  ])
  @PostMapping({ value: '/body', produces: 'application/json' })
  body(@RequestBody user: UserInfo): UserInfo {
    return user;
  }

  @ApiOperation({ value: '@PathVariable 测试' })
  @GetMapping('/path/{id}')
  @ApiImplicitParams([
    { description: '编号', paramType: 'path', name: 'id' }
  ])
  path(@PathVariable id:string) {
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