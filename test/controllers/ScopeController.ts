import { RequestMapping, Scope } from '../../index';

@Scope('prototype')
@RequestMapping('/scope')
export default class ScopeController {

  private scopeData = ''

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

/**
 * 
 *   
	

 https://mp.weixin.qq.com/a/~~Qus5Ccn3_2M~BCRFNGrsSxfuUGGmy4oAyg~~
 https://mp.weixin.qq.com/a/~~lh3T28GfuCM~I_iarOYV6BzZ7BemRSTXeg~~
 https://mp.weixin.qq.com/a/~~A-FKQaK2r3E~2ZzV_TIk1iI3d0h0TbXt6Q~~
 https://mp.weixin.qq.com/a/~~xaev5_n5Y3E~IG3BJnEj2weM120Ihya4bw~~


 * 
 * 
 */