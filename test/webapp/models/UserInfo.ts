import ApiModel from '../../../src/swagger/annotations/ApiModel';
import ApiModelProperty from '../../../src/swagger/annotations/ApiModelProperty';
import OrderModel from './OrderModel';

export const score = 121;

@ApiModel
class Super {
  @ApiModelProperty
  rootId: number

}

@ApiModel
class A extends Super {
  @ApiModelProperty
  parentId: number

  @ApiModelProperty
  parentName: string
}

@ApiModel({ description: '用户信息。。' })
export default class UserInfo extends A {

  static desc = 'hellos38'

  static from(data) {
    const user = new UserInfo();
    user.order = new OrderModel();
    user.userName = data.userName;
    console.log('ss')
    return user;
  }

  A = A

  @ApiModelProperty({ value: '年龄' })
  age: number = 120

  @ApiModelProperty({ value: '名称' })
  public get name() {
    return '';
  }

  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string


  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number

  @ApiModelProperty({ value: '性别' })
  public sex: string

  @ApiModelProperty({ value: '订单' })
  public order: OrderModel
}