import { Repository, ApiModel, ApiModelProperty, Autowired } from 'node-web-mvc';

class BaseOrder {
  @ApiModelProperty({ value: '地址' })
  address: string;
}

export enum OrderType {
  MALL = 'M',
  STMP = 'S'
}

@Repository
@ApiModel({ description: '订单' })
export default class OrderModel extends BaseOrder {
  constructor() {
    super();
    this.orderId = 10086;
    this.orderType = OrderType.STMP;
  }

  @ApiModelProperty({ value: '订单编号' })
  orderId: number;

  @ApiModelProperty({ value: '类型', enum: OrderType })
  orderType: OrderType;
}
