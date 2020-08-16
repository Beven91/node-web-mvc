import { Service, Autowired } from "../../src";

@Service
export default class OrderService {

  @Autowired
  private orderModel;

  constructor(){
    console.log('ssss');
    console.log(this.orderModel);
  }

  sayHello(){
    console.log('hello');
  }
}