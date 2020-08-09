import ApiModel from '../../src/swagger/annotations/ApiModel';
import ApiModelProperty from '../../src/swagger/annotations/ApiModelProperty';
import OrderModel from './OrderModel';

export const score = 121;

class A {
  name:string
}

@ApiModel({ value: '用户信息', description: '用户信息。。' })
export default class UserInfo {

  static desc = 'hellos38'

  static from(data) {
    const user = new UserInfo();
    user.order = new OrderModel();
    user.userName = data.userName;
    console.log('ss')
    return user;
  }

  A = A

  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string


  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number

  @ApiModelProperty({ value: '性别' })
  public sex: string

  @ApiModelProperty({ value: '订单', dataType: 'OrderModel' })
  public order: OrderModel
}