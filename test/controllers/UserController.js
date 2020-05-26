import { RequestMapping, PostMapping, ExceptionHandler } from '../../index';

@RequestMapping('/user')
export default class UserController {

  @PostMapping('/addUser')
  addUser(req, resp) {
    return 'aaa';
  }

  @RequestMapping('/setUser')
  addUser(req, resp) {
    this.user = {
      name: req.query.name
    }
    return 'aaa';
  }

  @RequestMapping('/getUser', 'get')
  getUser() {
    return JSON.stringify(this.user || {
      name: '李白'
    })
  }

  @RequestMapping('/business')
  doBusiness() {
    throw new Error('出错啦');
  }

  @ExceptionHandler()
  handleException(ex) {
    return JSON.stringify({ code: -99, message: ex.message })
  }

}