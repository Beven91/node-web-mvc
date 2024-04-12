import { Service, Autowired } from "../../../src";

@Service
export default class OrderService {

  @Autowired
  private orderModel;

  constructor(){
    console.log('ioc Create OrderService');
    console.log(this);
  }

  sayHello(){
    console.log('hello');
  }
}