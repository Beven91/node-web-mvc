/**
 * @module STSSOContext
 * @description 用于初始化当前sso登录用户权限的信息
 */
import 'reflect-metadata';
import Order, { GeneralResult as GeneralResult2, UserInfo } from './Order';
import { GeneralResult, OrderType } from './Order';
import Demo from './demo';

// const Demo2 = require('./demo');

type KK = typeof Order;

type NN = Order;

type SS = NN;


class My<T> {

}

function mydecorator(target:any) {

}

@mydecorator
export default class STSSOContext {
  // 当前请求对象
  private request: My<GeneralResult2<UserInfo>>;

  private request2: My<GeneralResult2<Order>>;

  private request3: My<GeneralResult2<KK>>;

  private request4: My<GeneralResult2<SS>>;

  private data: My<GeneralResult<OrderType>>;

  private demo: Demo;

  private demo2: typeof Demo;

  // private orderType: typeof OrderType;

  static TOKEN_NAME = 'x_gyroscope';


  getUserToken() {
    console.log(Order);
    // console.log(GeneralResult);
    // console.log(HttpServletRequest);
  }
}
