import { AssertFalse, AssertTrue, Digits, Furture, Max, Min, NotNull, Null, Past, Pattern, Size, Valid, Validated } from '../../../src';
import ApiModel from '../../../src/swagger/annotations/ApiModel';
import ApiModelProperty from '../../../src/swagger/annotations/ApiModelProperty';
import OrderModel from './OrderModel';

export const score = 121;

export function MyGroup(){ }

class AddressInfo {

  @NotNull({ message2: 'province不能为空' })
  public province: string

  public city: string
}

@ApiModel
class Super {
  @ApiModelProperty
  rootId: number

}

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

  @Digits({ integer: 3, fraction: 2, message2: '价格格式为 000.00' })
  price: number

  @Pattern({ regexp: /^[a-zA-Z0-9_-]{4,16}$/, message2: '用户名只能包含字母、数字、下划线、横杠且长度为4-16位' })
  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string


  @Max({ value: 100, message2: '用户编码不能超过100', groups: MyGroup })
  @Min({ value: 10, message2: '用户编码不能低于10' })
  @NotNull({ message2: '用户编码不能为空' })
  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number

  @ApiModelProperty({ value: '性别' })
  public sex: string

  @ApiModelProperty({ value: '订单' })
  public order: OrderModel

  @Size({ min: 1, max: 10, message2: '产品编码值应该为1到10位' })
  public productCode: string

  @Size({ min: 2, message2: 'items必须大于2项' })
  public items: string[]

  @Size({ max: 2, message2: '属性最多添加2项' })
  public props: Map<string, string>

  @Size({ max: 3, message2: 'buffer最多3个字节' })
  public buffer: Uint8Array

  @Size({ max: 3, message2: 'uniqueNums最多3个' })
  public uniqueNums: Set<number>

  @Past({ message2: 'passDate必须小于当前时间' })
  public passDate: Date

  @Furture({ message2: 'submitDate必须大于当前系统时间' })
  public submitDate: Date

  @Null({ message2: 'internalData必须为null' })
  public internalData: String

  @AssertTrue({ message2: 'isOk必须为true' })
  public isOk: boolean

  @AssertFalse({ message2: 'isFail必须为false' })
  public isFail:boolean

  @Valid
  @NotNull({ message2: 'address不能为空' })
  public address: AddressInfo

}