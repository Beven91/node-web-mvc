import { Service, Autowired } from "../../src";

@Service
export default class OrderService {

  @Autowired
  private orderModel;

  constructor(){
    console.log(this.orderModel);
  }

}