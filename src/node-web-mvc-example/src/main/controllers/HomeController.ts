
import path from 'path';
import { Api, ApiOperation, GetMapping, RequestMapping, RequestEntity, RequestParam, RequestHeader, ApiImplicitParams, RequestBody, PostMapping, PathVariable, Autowired, MultipartFile, ResponseFile, RestController, CorsOrigin, ResponseEntity, HttpStatus, HttpHeaders, Valid, ServletRequest, Validated } from 'node-web-mvc';
import UserId from '../annotations/UserId';
import OrderService from '../services/OrderService';
import { UserInfo } from '../models';
import { demoData } from './data';
import { MyGroup } from '../models/UserInfo';
import GeneralResult from '../models/GeneralResult';
import CommonResult from '../models/CommonResult';
import Keneral from '../models/Keneral';
import OrderModel, { OrderType } from '../models/OrderModel';
import Address from '../models/Address';

@Api({ description: '首页' })
@RestController
@CorsOrigin({
  allowCredentials: true,
  methods: [ 'DELETE' ],
  origins: [ 'http://local.test.shantaijk.cn:8082' ],
})
@RequestMapping({ value: '/home', method: [ 'GET', 'POST' ] })
export default class HomeController {
  @Autowired
  private orderService: OrderService;

  @Autowired
  private oService: OrderService;

  @GetMapping('/ss')
  getSss(): GeneralResult<string> {
    return new GeneralResult<string>(0, '999922299');
  }

  @ApiOperation({ value: 'RequestParam get参数' })
  @GetMapping('/requestParamsGet')
  async requestParamsGet(@RequestParam name: string, @RequestParam id: number) : Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return `name:${name},id:${id},${this.oService.getOrderName()}`;
  }

  @ApiOperation({ value: 'RequestParam post参数' })
  @PostMapping('/requestParamsPost')
  requestParamsPost(@RequestParam name: string, @RequestParam id: number): string {
    this.oService.sayHello();
    this.orderService.sayHello();
    return `name:${name},id:${id}`;
  }

  @PostMapping('/requestParamsNoAnnosWithGet')
  requestParamsNoAnnosWithGet(name: string, id: number): string {
    return `name:${name},id:${id}`;
  }


  @PostMapping('/requestParamsNoAnnosWithPost')
  requestParamsNoAnnosWithPost(name: string, id: number): string {
    return `name:${name},id:${id}`;
  }

  @ApiImplicitParams([
    { name: 'data', example: JSON.stringify({ name: '张三', age: 18, enabled: false }, null, 2) },
  ])
  @ApiOperation({ value: 'RequestParam接收Map' })
  @GetMapping('/map')
  mapGet(@RequestParam data: Map<string, any>): Map<string, any> {
    return data;
  }

  @ApiImplicitParams([
    { name: 'data', example: JSON.stringify({ name: '张三', age: 18, enabled: false }, null, 2) },
  ])
  @ApiOperation({ value: 'RequestBody接收Map' })
  @PostMapping('/map')
  mapPost(@RequestBody data: Map<string, any>): Map<string, any> {
    return data;
  }

  @ApiOperation({ value: 'Set数据接收' })
  @PostMapping('/set')
  set(@RequestParam data: Set<any>): Set<any> {
   return data;
  }

  @ApiOperation({ value: '@RequestParam 接收Array数据接收' })
  @PostMapping('/array')
  array(@RequestParam array: Array<string>): Array<string> {
    return array;
  }

  @ApiOperation({ value: '@RequestParam 接收指定类型的Array数据接收' })
  @PostMapping('/generic_array')
  genericArray(@RequestBody array: Address[]): Address[] {
    return array;
  }

  @ApiOperation({ value: 'Date,Boolean,数据接收' })
  @PostMapping('/booleanDate')
  booleanDate(@RequestParam date: Date, @RequestParam isShow: boolean): string {
    // TODO: 关于Date converter
    return `date:${date.toLocaleString()},\nisShow:${isShow}`;
  }

  @ApiOperation({ value: '使用@RequestParam 接收file参数' })
  @PostMapping('/requestParamWithMultipartFile')
  // @ApiImplicitParams([
  //   { description: '编号', paramType: 'query', name: 'id', required: true }
  // ])
  requestParamWithMultipartFile(@RequestParam({ required: true }) id: string, @RequestParam file: MultipartFile): string {
    file.transferTo('a.jpg');
    return 'home/index...' + id + ',file.name=' + file.name;
  }

  @ApiOperation({ value: '返回文件流' })
  @GetMapping('/stream')
  stream() : ResponseFile {
    return new ResponseFile(path.resolve('src/resources/aa/a.txt'));
  }

  @ApiOperation({ value: '下载文件' })
  @GetMapping('/download')
  download() : ResponseFile {
    return new ResponseFile(path.resolve('src/resources/aa/a.txt'), true);
  }

  @ApiOperation({ value: '@RequestHeader头部' })
  @GetMapping('/header')
  header(@RequestHeader({ value: 'accept' }) type: string): string {
    return 'home/index...' + type;
  }

  @ApiOperation({ value: '@RequestBody 测试' })
  @ApiImplicitParams([
    { description: '类型', name: 'user', example: demoData },
  ])
  @PostMapping({ value: '/body', produces: 'application/json' })
  body(@RequestBody @Validated(MyGroup) user: UserInfo): UserInfo {
    return user;
  }

  @ApiOperation({ value: '@PathVariable 测试' })
  @GetMapping('/path/{id}')
  path(@PathVariable id: number): string {
    return 'home/index...' + id + '===';
  }

  @ApiOperation({ value: '@UserId 测试' })
  @GetMapping('/userId')
  userId(@UserId id: string): string {
    return 'userId...' + id;
  }

  @ApiOperation({ value: '数据返回' })
  @GetMapping('/return')
  returnData() : GeneralResult<UserInfo[]> {
    return new GeneralResult(0, { models: [ demoData ] });
  }

  @ApiOperation({ value: '数据返回：属性泛型' })
  @ApiImplicitParams([
    { description: '类型', name: 'user', example: demoData },
  ])
  @PostMapping('/return2')
  returnData2(@RequestBody @Valid user: UserInfo): UserInfo {
    return user;
  }

  @ApiOperation({ value: '数据返回：属性泛型2' })
  @GetMapping('/return3')
  returnData3(): CommonResult<Keneral> {
    const k = new Keneral();
    k.userId = 10086;
    k.order = new OrderModel();
    k.sex = '男';
    k.userName ='不知道的人';
    k.order.orderId = 10022;
    k.order.orderType = OrderType.STMP;
    return new CommonResult(0, [ k ]);
  }

  @ApiOperation({ value: '自定义返回' })
  @GetMapping('/demo')
  demo(): string {
    return JSON.stringify([ 'aaa' ]);
  }

  @ApiOperation({ value: '测试ResponseHttpEntity返回' })
  @GetMapping('/httpEntity')
  httpEntity(httpEntity: RequestEntity): ResponseEntity {
    const entity = new ResponseEntity(HttpStatus.OK);
    entity.setHeader(HttpHeaders.LAST_MODIFIED, new Date().toUTCString());
    entity.setHeader('demo', '123424234');
    entity.setBody({ id: 100086 });
    return entity;
  }
}
