import { Repository, ApiModel, ApiModelProperty } from "../../../src";

class BaseOrder {

  @ApiModelProperty({ value: '地址' })
  address: string

}

enum OrderType {
  MALL = 'M',
  STMP = "S"
}

@Repository
@ApiModel({ description: '订单' })
export default class OrderModel extends BaseOrder {

  @ApiModelProperty({ value: '订单编号' })
  orderId: number

  @ApiModelProperty({ value: '类型', enum: OrderType })
  orderType: OrderType

}