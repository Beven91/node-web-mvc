import { ApiModel, ApiModelProperty } from '../../src/index';

export const score = 121;

@ApiModel({ value: '用户信息', description: '用户信息。。' })
export default class UserInfo {

  static desc = 'hellos38'

  static from(data) {
    const user = new UserInfo();
    user.userName = data.userName;
    console.log('ss')
    return user;
  }

  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string


  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number
}