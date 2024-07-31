import { AssertFalse, AssertTrue, Digits, Furture, JsonDeserialize, JsonFormat, JsonSerialize, Max, Min, NotNull, Null, Past, Pattern, Size, Valid, Validated } from '../../../src';
import ApiModel from '../../../src/swagger/annotations/ApiModel';
import ApiModelProperty from '../../../src/swagger/annotations/ApiModelProperty';
import ColorDeserializer from '../globalization/ColorDeseriailzer';
import ColorSerializer from '../globalization/ColorSerializer';
import Color from './Color';
import OrderModel from './OrderModel';

export const score = 121;

export function MyGroup() { }

class AddressInfo {
  @NotNull({ message: 'province不能为空' })
  public province: string;

  @NotNull({ message: '城市不能为空', groups: [ MyGroup ] })
  public city: string;
}

@ApiModel
class Super {
  @ApiModelProperty
  rootId: number;
}

class A extends Super {
  @ApiModelProperty
  parentId: number;

  @ApiModelProperty
  parentName: string;
}

@ApiModel({ description: '用户信息。。' })
export default class UserInfo extends A {
  static desc = 'hellos38';

  static from(data) {
    const user = new UserInfo();
    user.order = new OrderModel();
    user.userName = data.userName;
    return user;
  }

  A = A;

  @ApiModelProperty({ value: '年龄' })
  age: number = 120;

  @ApiModelProperty({ value: '名称' })
  public get name() {
    return '';
  }

  @Digits({ integer: 3, fraction: 2, message: '价格格式为 000.00' })
  price: number;

  @Pattern({ regexp: /^[a-zA-Z0-9_-]{4,16}$/, message: '用户名只能包含字母、数字、下划线、横杠且长度为4-16位' })
  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string;


  @Max({ value: 100, message: '用户编码不能超过{value}', groups: MyGroup })
  @Min({ value: 10, message: '用户编码不能低于{value}' })
  @NotNull({ message: '用户编码不能为空' })
  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number;

  @ApiModelProperty({ value: '性别' })
  public sex: string;

  @ApiModelProperty({ value: '订单' })
  public order: OrderModel;

  @Size({ min: 1, max: 10, message: '产品编码值应该为{min}到{max}位' })
  public productCode: string;

  @Size({ min: 2, message: 'items必须大于{min}项' })
  public items: string[];

  @Size({ max: 2, message: '属性最多添加2项' })
  public props: Map<string, string>;

  @Size({ max: 3, message: 'buffer最多{max}个字节' })
  public buffer: Uint8Array;

  @Size({ max: 3, message: 'uniqueNums最多{max}个' })
  public uniqueNums: Set<number>;

  @JsonFormat({ pattern: 'yyyy年MM月dd HH:mm:ss' })
  @Past({ message: 'passDate必须小于当前时间' })
  public passDate: Date;

  @Furture({ message: 'submitDate必须大于当前系统时间' })
  public submitDate: Date;

  @Null({ message: 'internalData必须为null' })
  public internalData: String;

  @AssertTrue({ message: 'isOk必须为true' })
  public isOk: boolean;

  @AssertFalse({ message: 'isFail必须为false' })
  public isFail:boolean;

  @Valid
  @NotNull({ message: 'address不能为空' })
  public address: AddressInfo;

  @JsonSerialize({ using: ColorSerializer })
  @JsonDeserialize({ using: ColorDeserializer })
  public color: Color;
}
