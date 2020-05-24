import { Scope, RequestMapping,PostMapping } from '../../index';


@RequestMapping('/user')
export default class UserController {

  @PostMapping('/addUser')
  addUser(req,resp){
    return 'aaa';
  }

  @RequestMapping('/getUser','get')
  getUser(){
    return JSON.stringify({
      name:'李白'
    })
  }
}