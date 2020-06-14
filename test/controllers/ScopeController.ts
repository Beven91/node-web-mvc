import { RequestMapping, GetMapping, Scope, Api, ApiOperation, ApiImplicitParams } from '../../index';
import UserInfo from '../models/UserInfo';
import { PostMapping } from '../../src/annotations';

@Api({ description: '作用域测试' })
@Scope('prototype')
@RequestMapping('/scope')
export default class ScopeController {

  private scopeData: UserInfo

  @ApiOperation({ value: '获取设置的对象', notes: '获取通过/scope/set设置的值，当前会返回值应该返回空，因为当前控制器类作用域设置成prototype' })
  @GetMapping('/get')
  getObj(req, resp) {
    return this.scopeData || '没有设置值';
  }

  @ApiOperation({ value: '设置数据', dataType: 'UserInfo' })
  @ApiImplicitParams([
    { name: 'user', paramType: 'body', value: '用户信息', required: true, dataType: 'UserInfo' },
  ])
  @PostMapping('/set')
  setObj(user) {
    this.scopeData = UserInfo.from(request.body);
    return this.scopeData;
  }

  @ApiOperation({ value: '异常测试' })
  @GetMapping('/business')
  doBusiness() {
    throw new Error('出错啦');
  }

  @ApiOperation({ value: '管理员入口' })
  @GetMapping('/admin')
  admin() {
  }
}