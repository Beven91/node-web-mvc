
import path from 'path';
import { Api, ApiOperation, GetMapping, RequestMapping, RequestParam, RequestHeader, ApiImplicitParams, RequestBody, PostMapping, PathVariable, Autowired, MultipartFile, ResponseFile, RestController, CorsOrigin, ResponseEntity, HttpStatus, HttpHeaders, Valid, ServletRequest, Validated } from '../../../src/index';
import UserId from '../annotations/UserId';
import OrderService from '../services/OrderService';
import { UserInfo } from '../models/';
import RequestEntity from '../../../src/servlets/models/RequestEntity';
import City from '../models/Models';
import { demoData } from './data';
import { MyGroup } from '../models/UserInfo';

@Api({ description: '首页' })
@RestController
// @CorsOrigin({
//   allowCredentials: true,
//   origins: ['http://local.test.shantaijk.cn:8082']
// })
@RequestMapping({ value: '/home', method: ['GET', 'POST'] })
export default class HomeController {

  @Autowired
  private orderService: OrderService;

  @Autowired
  private oService: OrderService

  @ApiOperation({ value: 'RequestParam get参数' })
  @GetMapping('/requestParamsGet')
  requestParamsGet(@RequestParam name: string, @RequestParam id: number) {
    return `name:${name},id:${id},${this.oService.getOrderName()}`;
  }

  @ApiOperation({ value: 'RequestParam post参数' })
  @PostMapping('/requestParamsPost')
  requestParamsPost(@RequestParam name: string, @RequestParam id: number) {
    return `name:${name},id:${id}`;
  }

  @PostMapping('/requestParamsNoAnnosWithGet')
  requestParamsNoAnnosWithGet(name: string, id: number) {
    return `name:${name},id:${id}`;
  }


  @PostMapping('/requestParamsNoAnnosWithPost')
  requestParamsNoAnnosWithPost(name: string, id: number) {
    return `name:${name},id:${id}`;
  }

  @ApiImplicitParams([
    { name: 'data', example: JSON.stringify({ name: '张三', age: 18, enabled: false }, null, 2) }
  ])
  @ApiOperation({ value: 'RequestParam接收Map' })
  @GetMapping('/map')
  mapGet(@RequestParam data: Map<string, any>) {
    const values: string[] = [
      `Type: ${Object.prototype.toString.call(data)}`
    ];
    data.forEach((value, key) => {
      values.push(`${key}:${value}`)
    })
    return values.join('\n');
  }

  @ApiImplicitParams([
    { name: 'data', example: JSON.stringify({ name: '张三', age: 18, enabled: false }, null, 2) }
  ])
  @ApiOperation({ value: 'RequestBody接收Map' })
  @PostMapping('/map')
  mapPost(@RequestBody data: Map<string,any>) {
    const values: string[] = [
      `Type: ${Object.prototype.toString.call(data)}`
    ];
    data.forEach((value, key) => {
      values.push(`${key}:${value}`)
    })
    return values.join('\n');
  }

  @ApiOperation({ value: 'Set数据接收' })
  @PostMapping('/set')
  set(@RequestParam data: Set<any>) {
    const values: string[] = [
      `Type: ${Object.prototype.toString.call(data)}`
    ];
    data.forEach((v) => values.push(v));
    return values.join(',\n');
  }

  @ApiOperation({ value: '@RequestParam 接收Array数据接收' })
  @PostMapping('/array')
  array(@RequestParam array: Array<string>) {
    // TODO: 如何补偿泛型运行时的类型参数
    const values: string[] = [
      `Type: ${Object.prototype.toString.call(array)}`,
      ...array
    ];
    return values.join(',\n');
  }

  @ApiOperation({ value: 'Date,Boolean,数据接收' })
  @PostMapping('/booleanDate')
  booleanDate(@RequestParam date: Date, @RequestParam isShow: boolean) {
    // TODO: 关于Date converter
    return `date:${date.toLocaleString()},\nisShow:${isShow}`;
  }

  @ApiOperation({ value: '使用@RequestParam 接收file参数', returnType: 'string' })
  @PostMapping('/requestParamWithMultipartFile')
  // @ApiImplicitParams([
  //   { description: '编号', paramType: 'query', name: 'id', required: true }
  // ])
  requestParamWithMultipartFile(@RequestParam({ required: true }) id: string, @RequestParam file: MultipartFile) {
    this.oService.sayHello();
    this.orderService.sayHello();
    file.transferTo('a.jpg')
    return 'home/index...' + id + ',file.name=' + file.name;
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
    { description: '类型', name: 'user', example: demoData }
  ])
  @PostMapping({ value: '/body', produces: 'application/json' })
  body(@RequestBody @Validated(MyGroup) user: UserInfo): UserInfo {
    return user;
  }

  @ApiOperation({ value: '@PathVariable 测试' })
  @GetMapping('/path/{id}')
  path(@PathVariable id: number) {
    return 'home/index...' + id + '===';
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
  @ApiImplicitParams([
    { description: '类型', name: 'user', example: demoData }
  ])
  @PostMapping('/return2')
  returnData2(@RequestBody @Valid user: UserInfo) {

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

  @ApiOperation({ value: '测试ResponseHttpEntity返回', returnType: ['hello'] })
  @GetMapping('/httpEntity')
  httpEntity(httpEntity: RequestEntity) {
    const entity = new ResponseEntity(HttpStatus.OK);
    entity.setHeader(HttpHeaders.LAST_MODIFIED, new Date().toUTCString());
    entity.setHeader('demo', '123424234')
    entity.setBody({ id: 100086 })
    return entity;
  }
}