
import path from 'path';
import { Api, ApiOperation, GetMapping, RequestMapping, RequestParam, RequestHeader, ApiImplicitParams, RequestBody, PostMapping, PathVariable, Autowired, MultipartFile, ResponseFile } from '../../../src/index';
import UserId from '../annotations/UserIdAnnotation';
import Security from '../annotations/SecurityAnnotation';
import OrderService from '../services/OrderService';
import { UserInfo } from '../models/';

@Api({ value: '首页' })
@RequestMapping('/home')
export default class HomeController {

  @Autowired
  private orderService: OrderService;

  @Autowired
  private oService: OrderService

  @ApiOperation({ value: 'RequestParam get参数' })
  @GetMapping('/rp')
  requestParamsGet(@RequestParam name: string, @RequestParam id: number) {
    return `name:${name},id:${id}`;
  }

  @Security
  @ApiOperation({ value: 'RequestParam post参数' })
  @ApiImplicitParams([
    { name: 'name', paramType: 'formData' },
    { name: 'id', paramType: 'formData' },
  ])
  @PostMapping('/rp')
  requestParamsPost(@RequestParam name: string, @RequestParam id: number) {
    return `name:${name},id:${id}`;
  }

  @ApiOperation({ value: 'RequestParam接收Map' })
  @ApiImplicitParams([
    { name: 'name', paramType: 'query' },
    { name: 'age', paramType: 'query' },
  ])
  @GetMapping('/map')
  mapGet(@RequestParam data: Map<string, any>) {
    const values = [] as string[];
    data.forEach((value, key) => {
      values.push(`${key}:${value}`)
    })
    return values.join('\n');
  }

  @ApiOperation({ value: 'RequestBody接收Map' })
  @PostMapping('/map')
  mapPost(@RequestBody data: Map<string, any>) {
    const values = [] as string[];
    data.forEach((value, key) => {
      values.push(`${key}:${value}`)
    })
    return values.join('\n');
  }

  @ApiOperation({ value: 'Set数据接收' })
  @PostMapping('/set')
  set(@RequestParam data: Set<any>) {
    const values = [] as string[];
    data.forEach((v) => values.push(v));
    return values.join(',');
  }

  @ApiOperation({ value: '@RequestParam 接收Array数据接收' })
  @PostMapping('/array')
  array(@RequestParam array: Array<string>) {
    return array.join(',');
  }

  @ApiOperation({ value: 'Date,Boolean,数据接收' })
  @PostMapping('/params')
  others(@RequestParam date: Date, @RequestParam isShow: boolean) {
    return `date:${date.toLocaleString()},\nisShow:${isShow}`;
  }

  @ApiOperation({ value: '@RequestParam file测试', returnType: 'string' })
  @PostMapping('/params2')
  // @ApiImplicitParams([
  //   { description: '编号', paramType: 'query', name: 'id', required: true }
  // ])
  index(@RequestParam({ required: true }) id: string, @RequestParam file: MultipartFile) {
    this.oService.sayHello();
    this.orderService.sayHello();
    return 'home/index...' + id;
  }

  @ApiOperation({ value: '返回文件流' })
  @GetMapping('/stream')
  stream() {
    return new ResponseFile(path.resolve('test/resources/aa/a.txt'));
  }

  @ApiOperation({ value: '下载文件' })
  @GetMapping('/download')
  download() {
    return new ResponseFile(path.resolve('test/resources/aa/a.txt'), true);
  }

  @ApiOperation({ value: '@RequestHeader头部' })
  @GetMapping('/header')
  header(@RequestHeader({ value: 'accept' }) type: string) {
    return 'home/index...' + type;
  }

  @ApiOperation({ value: '@RequestBody 测试' })
  @ApiImplicitParams([
    { description: '类型', paramType: 'body', name: 'user', example: { name: 1 } }
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
  path(@PathVariable id: string) {
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

  @ApiOperation({ value: '数据返回：属性泛型', returnType: 'GeneralResult<UserInfo[]>' })
  @GetMapping('/return2')
  returnData2() {

  }

  @ApiOperation({ value: '数据返回：属性泛型2', returnType: 'CommonResult<Keneral[]>' })
  @GetMapping('/return3')
  returnData3() {

  }

  @ApiOperation({ value: '自定义返回', returnType: ['hello'] })
  @GetMapping('/demo')
  demo() {
    return JSON.stringify(['aaa']);
  }
}