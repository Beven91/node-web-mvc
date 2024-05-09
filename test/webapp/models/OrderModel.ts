import { Repository, ApiModel, ApiModelProperty, Autowired } from "../../../src";
import Keneral from "./Keneral";

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

  constructor() {
    super();
    this.orderId = 100086;
    this.orderType = OrderType.STMP;
  }

  @Autowired
  private kk: Keneral

  @ApiModelProperty({ value: '订单编号' })
  orderId: number

  @ApiModelProperty({ value: '类型', enum: OrderType })
  orderType: OrderType

}