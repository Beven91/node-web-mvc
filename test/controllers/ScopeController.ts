import { RequestMapping, GetMapping, Scope } from '../../src/index';
import { Api, ApiOperation, RequestBody, RequestParam, ApiImplicitParams } from '../../src/index';
import UserInfo from '../models/UserInfo';
import { PostMapping } from '../../src/index';

@Api({ description: '作用域测试' })
@Scope('prototype')
@RequestMapping('/scope')
export default class ScopeController {

  private scopeData: UserInfo

  @ApiOperation({ value: '获取设置的对象', notes: '获取通过/scope/set设置的值，当前会返回值应该返回空，因为当前控制器类作用域设置成prototype' })
  @GetMapping('/get')
  getObj() {
    return this.scopeData || '没有设置值';
  }

  @ApiOperation({ value: '设置数据', returnType: 'UserInfo' })
  @ApiImplicitParams([
    RequestBody({ value: 'user', desc: '用户信息', required: true, dataType: UserInfo }),
    RequestParam({ value: 'id', desc: '用户id', required: true })
  ])
  @PostMapping({ value: '/set', produces: 'application/json' })
  setObj(user: UserInfo, id) {
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
  }
}