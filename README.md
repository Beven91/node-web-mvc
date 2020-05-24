# mvc 

### 安装

> npm

```shell

npm install node-web-mvc

```

> yarn

```shell

yarn add node-web-mvc

```

## 2.0内容

### 默认使用方式

> 传统方式

> main.js

```js
import { Registry, ControllerFactory,AreaRegistration,Routes } from 'node-web-mvc';

//注册api/controllers目录下的所有controller
ControllerFactory.registerControllers(path.resolve('api/controllers'));
//注册所有MVC域(Area)
AreaRegistration.registerAllAreas(path.resolve('api/areas'));

// 或者可以设置自定义的控制器工厂
// ControllerFactory.defaultFactory = new ControllerFactory();

//设置默认路由
//推荐：最好把以下代码放到所有路由配置的最后，以降低其优先级，防止吞掉其他指定的路由
Routes.mapRoute('{controller}/{action}', { controller: 'Home', action: 'index' });

// 启动Mvc   mode 目前可以设置成 express 或者 koa
app.use(Registry.launch({ mode:'express' }));

```

> controller.js

```js
const { Controller } = require('node-mvc');

export default class HomeController extends Controller {

  index(request,response){
    return '返回内容';
  }
}

```

### SpringMvc 使用方式

> 启动配置

```js
import { Registry } from 'node-web-mvc';

//注册api/controllers目录下的所有controller
Registry.registerControllers(path.resolve('api/controllers'));

// 启动Mvc   mode 目前可以设置成 express 或者 koa
app.use(Registry.launch({ mode:'express' }));

```

> HomeController

```js
import { RequestMapping, PostMapping } from 'node-web-mvc';

@Scope('prototype')
@RequestMapping('/user')
export default class UserController {

  @PostMapping('/addUser')
  addUser(req, resp) {
    return 'aaa';
  }

  @RequestMapping('/getUser', 'get')
  getUser() {
    return JSON.stringify({
      name: '李白'
    })
  }
}
```