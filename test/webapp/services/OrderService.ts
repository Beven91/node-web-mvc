import { Service, Autowired } from "../../../src";
import GeneralResult from '../models/GeneralResult';

@Service
export default class OrderService {

  @Autowired
  private orderModel;

  constructor(){
    console.log('ssss');
    console.log(this.orderModel);
    console.log(GeneralResult);
  }

  sayHello(){
    console.log('hello');
  }
}