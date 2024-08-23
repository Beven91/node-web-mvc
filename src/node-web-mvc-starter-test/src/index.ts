/**
 * @module STSSOContext
 * @description 用于初始化当前sso登录用户权限的信息
 */
import Order, { GeneralResult, UserInfo } from './Order';
import Demo from './demo';

interface HttpServletRequest {
  getHeader: (name: string) => string
}

class My<T> {

}

function mydecorator(target:any) {

}

@mydecorator
export default class STSSOContext {
  // 当前请求对象
  private request: My<GeneralResult<UserInfo>>;

  private demo: Demo;

  static TOKEN_NAME = 'x_gyroscope';


  getUserToken() {
    console.log(Order);
    // console.log(GeneralResult);
    // console.log(HttpServletRequest);
  }
}
