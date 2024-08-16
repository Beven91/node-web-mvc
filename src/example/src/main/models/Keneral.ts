import { Autowired, Component, Qualifier, ApiModel, ApiModelProperty } from 'node-web-mvc';
import OrderService from '../services/OrderService';
import OrderModel from './OrderModel';

@Component
@ApiModel({ value: 'KeneralV2', description: '我的数据' })
export default class Keneral {
  // @Qualifier('orderService')
  // @Autowired
  // private orderService: OrderService

  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string;


  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number;

  @ApiModelProperty({ value: '性别' })
  public sex: string;

  @ApiModelProperty({ value: '订单' })
  public order: OrderModel;
}
