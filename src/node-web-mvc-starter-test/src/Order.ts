export default class Order {

}

class Paged<D> {


}

export class UserInfo {

}

export enum OrderType {
  M = 1,
  O = 2
}

export class GeneralResult<T> {
  public data: Paged<T>;

  public id: string;

  public name: string | number;

  public favorite: string[];

  public items: Order[];

  public order: Order;


  public x: T;
}


export function doSomething(): GeneralResult<UserInfo> {
  const a = 10;
  const c = a * 100;
  return null;
}
