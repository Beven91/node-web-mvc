import { RequestMapping, Scope } from '../../index';

@Scope('prototype')
@RequestMapping('/scope')
export default class ScopeController {

  @RequestMapping('/get')
  getObj(req, resp) {
    return this.scopeData || '没有设置值';
  }

  @RequestMapping('/set')
  setObj(request) {
    this.scopeData = request.query.id;
    return 'ok';
  }

  @RequestMapping('/business')
  doBusiness() {
    throw new Error('出错啦');
  }
}