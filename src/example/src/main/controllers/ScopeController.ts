import { RequestMapping, GetMapping, Scope, RestController } from 'node-web-mvc';
import { Api, ApiOperation, RequestBody, RequestParam, ApiImplicitParams } from 'node-web-mvc';
import UserInfo from '../models/UserInfo';
import { PostMapping } from 'node-web-mvc';


@Api({ description: '作用域测试(原型模式)' })
@Scope('prototype')
@RequestMapping('/scope')
@RestController
export default class ScopeController {
  private scopeData: UserInfo;

  @ApiOperation({ value: '获取控制器实例设置的对象', notes: '获取通过/scope/set设置的值，当前会返回值应该返回空，因为当前控制器类作用域设置成prototype' })
  @GetMapping({ value: '/get', produces: 'application/json' })
  getObj() {
    return this.scopeData || { message: '没有设置值' };
  }

  @ApiOperation({ value: '设置数据到控制器实例上', returnType: 'UserInfo' })
  @ApiImplicitParams([
    { name: 'user', description: '用户信息', required: true, dataType: UserInfo },
    { name: 'id', description: '用户id', required: true },
  ])
  @PostMapping({ value: '/set', produces: 'application/json' })
  setObj(@RequestBody user: UserInfo, id: number) {
    this.scopeData = user;
    this.scopeData.userId = id;
    return this.scopeData;
  }

  @ApiOperation({ value: '全局异常测试' })
  @GetMapping('/business')
  doBusiness() {
    throw new Error('出错啦');
  }

  @ApiOperation({ value: '管理员入口' })
  @GetMapping('/admin')
  admin() {
    return 'secret';
  }
}
