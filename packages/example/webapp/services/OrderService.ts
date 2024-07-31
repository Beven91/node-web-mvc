import { Service, Autowired } from '../../../src';
import OrderModel from '../models/OrderModel';
import MyService from './MyService';

@Service
export default class OrderService {
  @Autowired
  private myService:MyService;

  @Autowired
  private orderModel: OrderModel;


  constructor() {
    console.log('ioc Create OrderService');
    console.log(this);
  }

  getOrderName() {
    return 'orderInfoResponse orderId=' + this.orderModel.orderId;
  }

  sayHello() {
    console.log('hello ok');
  }
}
