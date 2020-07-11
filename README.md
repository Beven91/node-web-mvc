
<p align="center">
  spring style web mvc framework
</p>

<h1 align="center">Node Web Mvc</h1>

## 安装

> npm

```shell

npm install node-web-mvc

```

> yarn

```shell

yarn add node-web-mvc

```

## 启动

`node-web-mvc` 默认支持三种启动模式

- node  纯node模式，通过`http`模块来启动服务

- express 通过`express`的中间件来附加服务

- koa 通过`koa`的中间件类附加服务

- 如果要接入到其他类型框架，可参考[`如何定制一个上下文`](#如何定制一个上下文)


### node 模式

```js
import { Registry } from 'node-web-mvc';

// 启动Mvc  
Registry.launch({
  // 启动模式： 可选类型: node | express | koa
  mode: 'node',
  // 服务端口
  port: 9800,
  // 热更新配置
  hot: {
    // 配置热更新监听的目录
    cwd: path.resolve('./'),
  },
  // 配置controller存放目录，用于进行controller自动载入与注册使用
  cwd: path.resolve('./controllers'),
});
```

### express 模式

```js
const express = require('express');
const app = express();

app.use('/api', Registry.launch({
  // 启动模式： 可选类型: node | express | koa
  mode: 'node',
  // 服务端口
  port: 9800,
  // 指定路由基础路径
  base: '/api',
  // 热更新配置
  hot: {
    // 配置热更新监听的目录
    cwd: path.resolve('./'),
  },
  // 配置controller存放目录，用于进行controller自动载入与注册使用
  cwd: path.resolve('./controllers'),
}));
```

### koa 模式

```js
const Koa = require('koa');
const app = new Koa();

app.use('/api', Registry.launch({
  // 启动模式： 可选类型: node | express | koa
  mode: 'node',
  // 服务端口
  port: 9800,
  // 指定路由基础路径
  base: '/api',
  // 热更新配置
  hot: {
    // 配置热更新监听的目录
    cwd: path.resolve('./'),
  },
  // 配置controller存放目录，用于进行controller自动载入与注册使用
  cwd: path.resolve('./controllers'),
}));
```

## 控制器 Controller

完成启动配置后，可以在控制器目录下定义对应的控制器

控制器的定义风格和`Spring Mvc`风格一致。

> 例如:

```js
@RequestMapping('/home')
class HomeController { 

  @RequestMapping({ value:'/index',method:'GET' })
  index(){
    return 'Hi i am home index';
  }
}
```
更多的控制器配置，我们可以阅读后面通过注解来完善控制器。

## 路由映射

### `@RequestMapping` 

该注解用于将请求映射到指定控制器。

有两种使用方式

#### 简要模式

仅配置访问路径，例如： 以下例子中，仅配置 以 `/home` 来访问`HomeController`

```js
@RequestMapping('/home')
class HomeController { 

}
```

#### 详细配置

通过传入一个对象[`RouteMappingOptions`](#RouteMappingOptions)来进行详细映射。

> 以下例子通过`@RequestMapping`配置 允许在`GET`方式下通过`/home/index`路由来访问 `HomeController`的`index`函数

```js
@RequestMapping('/home')
class HomeController { 

  @RequestMapping({ value:'/index',method:'GET' })
  index(){
    return 'Hi i am home index';
  }
}
```

在大多数情况下，我们只会配置`路由`与`请求类型` 可以通过以下几个注解来进行快捷配置。

- `@GetMapping`  映射一个`method`为 `GET`的请求

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  index(){
    return 'Hi i am home index';
  }
}
```

- `@PostMapping` 映射一个`method`为 `POST`的请求

- `@PutMapping` 映射一个`method`为 `PUT`的请求

- `@DeleteMapping` 映射一个`method`为 `DELETE`的请求

- `@PatchMapping` 映射一个`method`为 `PATCH`的请求

#### 路由风格

通过 `@RequestMapping` 等注解配置路由时，可以有以下几种配置风格

- `普通`路由

```js
@GetMapping('/detail/index')
```

- `参数占位`类型

> 使用 `{}` 来标识占位

通过`占位`映射的路由参数，可以通过[`@PathVariable`](#PathVariable) 注解来提取

```js
@GetMapping('/detail/{id}')
```

> 使用 `:` 来标识占位

```js
@GetMapping('/detail/:id')
```

> `正则`风格路由
```js
@GetMapping('/route/:foo/(.*)')
```

## 参数提取

我们可以通过以下几个注解来定义请求参数的提取方式。

- `@RequestParam` 提取类型为`urleoncoded`的参数

- `@RequestBody` 提取整个`body`内容，通常是提取成为一个`json`对象

- `@PathVariable` 提取路由中的占位参数

- `@RequestHeader` 提取请求头中的指定名的请求头做为参数

- `@ServletParam` 用于提取`request`与`response`

### RequestParam

从`urleoncoded`的内容中提取指定名称的参数

`@RequestParam` 作为参数注解，不进行任何配置，默认会以参数名来作为提取名依据

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  index(@RequestParam name){
    return `Hi ${name}, i am home index`;
  }
}
```

同时`@RequestParam` 也可以进行详细配置[`MethodParameterOptions`](#MethodParameterOptions)

> 例如： 将url中传递过来的`userName`提取实参调用时传递给`index`函数的`name`形参，且配置该参数必填

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  index(@RequestParam({ value:'userName', required:true }) name){
    return `Hi ${name}, i am home index`;
  }
}
```

### RequestBody 

提取整个`body`内容，通常是提取成为一个`json`对象
```js
@RequestMapping('/order')
class OrderController { 

  @GetMapping('/save')
  saveOrder(@RequestBody order){
    console.log(order);
  }
}
```

### PathVariable 

从请求路由中提取路径参数

```js
@RequestMapping('/order')
class OrderController { 

  @GetMapping('/detail/:id')
  detail(@PathVariable id){
    return `Order ${id}`;
  }
}
```

### RequestHeader 

从请求头中提取参数

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  detail(@RequestHeader('content-type') ct){
    return `content-type: ${ct}`;
  }
}
```

### ServletRequest 

提取`request`整个对象。

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  detail(@ServletRequest request){
    
  }
}
```

### ServletResponse

提取`response`整个对象。

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  detail(@ServletResponse response){
    
  }
}
```

## 返回内容

在控制器具体函数中，我们可以返回以下几种类型来将内容返回到客户端。

- InterruptModel 返回空内容，如果是使用express 则和`next`函数类似

- ModelAndView 返回一个视图

- String 返回一个字符串

- Object 如果需要正常返回，需要通过`RequestMapping`指定produces为`application/json`

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  index(){
    return new ModelAndView('home/index');
  }

  @GetMapping('/string')
  strings(){
    return `output :String`;
  }

  @GetMapping({ value: '/object', produces:'application/json' })
  list(){
    return [
      { name:'张三',id:100 }
    ];
  }
}
```

## 视图

框架默认不具备视图渲染功能，不过我们可以自定义视图解析器来支持渲染像`ejs` ,`handlebars`等类型的视图。

###  第一步 实现一个ejs 视图(`View`) 

> ./EjsView.ts

```js
/**
 * @module EjsView
 * @description Razor视图
 */
import ejs from 'ejs';
import { View } from 'node-web-mvc';

export default class EjsView extends View {

  /**
   * 进行视图渲染
   * @param model 当前视图的内容
   * @param request 当前视图
   * @param response 
   */
  render(model, request, response) {
    return ejs.renderFile(this.url, model).then((html) => {
      response.setHeader('Content-Type', 'text/html');
      response.setStatus(200).end(html, 'utf8');
    })
  }
}
```

###  第二步 实现一个ejs视图解析器

>  EjsViewResolver.ts

通过重写`UrlBasedViewResolver` 的`internalResolve` 来解析`ejs`的视图

```js
import fs from 'fs';
import path from 'path';
import { UrlBasedViewResolver,HttpServletRequest,View } from 'node-web-mvc'
import EjsView from './EjsView';

export default class EjsViewResolver extends UrlBasedViewResolver {

  internalResolve(viewName: string, model: any, request: HttpServletRequest): View {
    const file = path.resolve(viewName);
    if (fs.existsSync(file)) {
      return new EjsView(viewName);
    }
    return null;
  }
}
```

### 第三步 注册ejs视图解析器

启动时通过`addViewResolvers`配置来注册视图解析器。

```js
import { Registry } from 'node-web-mvc';

// 启动Mvc  
Registry.launch({
  // 通过配置，来注册ejs视图解析器s
  addViewResolvers(registry) {
    // 注册ejs视图解析器
    registry.addViewResolver(new EjsViewResolver('test/WEB-INF/', '.ejs'))
  }
});
```

## HandlerInterceptorAdapter 

切面

## HttpMessageConverter  

消息转换器

## HandlerMethodArgumentResolver 

参数解析器

## Swagger

框架支持swagger文档生成功能

可通过以下注解来完成文档元数据定义

- `@Api` 定义一个接口服务

```js
@Api({ description: '首页控制器' })
class HomeConntroller {

}
```

- `@ApiOperation` 定义一个接口操作

```js
@Api({ description: '首页控制器' })
class HomeConntroller {

  @ApiOperation({ value: '首页列表数据', notes: '这是备注' })
  index(){
  }
}
```

- `@ApiImplicitParams` 定义接口操作参数信息
```js
@Api({ description: '首页控制器' })
class HomeConntroller {

  @ApiOperation({ value: '首页列表数据', notes: '这是备注' })
  @GetMapping('/index')
  index(){
  }

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    RequestParam({ value: 'file', desc: '证书', required: true, dataType: MultipartFile }),
    RequestParam({ value: 'desc', desc: '描述', required: true, paramType: 'formData' }),
    RequestParam({ value: 'id', desc: '用户id', required: true })
  ])
  @PostMapping('/upload')
  upload(file: MultipartFile, desc, id) {
    return file.transferTo('app_data/images/' + file.name);
  }
}
```

- `@ApiModel` 定义一个实体类

```js
@ApiModel({ value: '用户信息', description: '用户信息。。' })
export default class UserInfo {

}
```

- `@ApiModelProperty` 定义实体类属性

```js
@ApiModel({ value: '用户信息', description: '用户信息。。' })
export default class UserInfo {

  @ApiModelProperty({ value: '用户名', required: true, example: '张三' })
  public userName: string


  @ApiModelProperty({ value: '用户编码', required: true, example: 1 })
  public userId: number
}
```

## 类型定义

### MethodParameterOptions

```js
class MethodParameterOptions {
  /**
   * 需要从请求中提取的参数名称
   */
  public value: string

  /**
   * 当前参数的描述信息
   */
  public desc?: string

  /**
  * 参数是否必须传递 默认值为 true
  */
  public required?: boolean

  /**
   * 参数默认值,如果设置了默认值，则会忽略 required = true
   */
  public defaultValue?: any

  /**
   * 参数的数据类型
   */
  public dataType?: Function

  /**
   * 参数传入类型 可选的值有path, query, body, header or form
   */
  public paramType?: string
}

```

### RouteMappingOptions

```js
class RouteMappingOptions {
 /**
   * 当前路由路径值
   */
  value: string | Array<string>

  /**
   * 当前路由能处理的Http请求类型
   */
  method?: Map<string, boolean>

  /**
   * 当前路由设置的返回内容类型
   */
  produces?: string

  /**
   * 当前路由能接受的内容类型
   */
  consumes?: Array<string>

  /**
   * 当前路由需要的请求头信息
   */
  headers?: Map<string, string>

  /**
   * 当前路由需要的请求参数
   */
  params?: Map<string, any>
}
```