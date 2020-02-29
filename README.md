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


### 使用

> express

```js
const { Registry, ControllerFactory,AreaRegistration,Routes } = require('node-mvc');

//注册api/controllers目录下的所有controller
ControllerFactory.registerControllers(path.resolve('api/controllers'));
//注册所有MVC域(Area)
AreaRegistration.registerAllAreas(path.resolve('api/areas'));

// 或者可以设置自定义的控制器工厂
// ControllerFactory.defaultFactory = new ControllerFactory();

//设置默认路由
//推荐：最好把以下代码放到所有路由配置的最后，以降低其优先级，防止吞掉其他指定的路由
Routes.mapRoute('{controller}/{action}', { controller: 'Home', action: 'index' });

// 启动Mvc  
app.use(Registry.launch());

```


> koa

```js
const { Registry, ControllerFactory,AreaRegistration,Routes } = require('node-mvc');

//注册api/controllers目录下的所有controller
ControllerFactory.registerControllers(path.resolve('api/controllers'));
//注册所有MVC域(Area)
AreaRegistration.registerAllAreas(path.resolve('api/areas'));

// 或者可以设置自定义的控制器工厂
// ControllerFactory.defaultFactory = new ControllerFactory();

//设置默认路由
//推荐：最好把以下代码放到所有路由配置的最后，以降低其优先级，防止吞掉其他指定的路由
Routes.mapRoute('{controller}/{action}', { controller: 'Home', action: 'index' });

// 启动Mvc  
app.use(Registry.launchKoa());

```