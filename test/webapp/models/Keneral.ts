import ApiModel from '../../../src/swagger/annotations/ApiModel';
import ApiModelProperty from '../../../src/swagger/annotations/ApiModelProperty';
import OrderModel from './OrderModel';

export const score = 121;

@ApiModel({ value: '数据', description: '我的数据' })
export default class Keneral {

  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string


  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number

  @ApiModelProperty({ value: '性别' })
  public sex: string

  @ApiModelProperty({ value: '订单', dataType: 'OrderModel' })
  public order: OrderModel
}