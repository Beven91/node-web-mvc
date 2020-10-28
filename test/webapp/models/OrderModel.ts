import { Repository, ApiModel, ApiModelProperty } from "../../../src";

@Repository
@ApiModel({ description:'订单' })
export default class OrderModel {

  @ApiModelProperty({ value:'订单编号' })
  orderId:number

}