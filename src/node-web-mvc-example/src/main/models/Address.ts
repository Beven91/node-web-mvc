import { ApiModel, ApiModelProperty } from 'node-web-mvc';

@ApiModel({ description: '用户信息。。' })
export default class Address {
  @ApiModelProperty('编号')
  id: number;

  @ApiModelProperty('详细地址')
  detail: string;
}
