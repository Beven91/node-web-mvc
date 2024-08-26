/**
 * @module STSSOContext
 * @description 用于初始化当前sso登录用户权限的信息
 */
import 'reflect-metadata';
import Order, { GeneralResult as GeneralResult2, UserInfo, OrderType } from './Order';
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
  private request: My<GeneralResult2<UserInfo>>;

  private request2: My<GeneralResult2<Order>>;

  private demo: Demo;

  // private orderType: typeof OrderType;

  static TOKEN_NAME = 'x_gyroscope';


  getUserToken() {
    // console.log(Order);
    // console.log(GeneralResult);
    // console.log(HttpServletRequest);
  }
}
