
<p align="center">
  spring style web mvc framework
</p>

<h1 align="center">Node Web Mvc</h1>

## 安装

> npm

```shell

npm install node-web-mvc reflect-metadata

```

> yarn

```shell

yarn add node-web-mvc reflect-metadata

```

## 启动

`node-web-mvc` 默认支持三种启动模式

- node  通过`http`模块来启动服务

- express 通过`express`的中间件来附加服务

- koa 通过`koa`的中间件类附加服务

- 如果要接入到其他类型框架，可参考[`如何定制一个上下文`](#如何定制一个上下文)


### node 模式

`Registry.launch`启动时，配置结构可参考: [`WebAppConfigurerOptions`](#WebAppConfigurerOptions)

```js
import { Registry } from 'node-web-mvc';

// 启动Mvc  
Registry.launch({
  // 启动模式： 可选类型: node | express | koa
  mode: 'node',
  // 服务端口
  port: 9800,
  // 热更新配置：改动接口代码无需重启，直接更新，推荐当前配置，仅在开发环境下使用
  hot: {
    // 配置热更新监听的目录
    cwd: path.resolve('./'),
  },
  //resource:{
    //// 是否开启gzip压缩
    //gzipped: true/false
    ////开启gzip的媒体类型字符串
    //mimeTypes: 'text/css'
  //}
  // 配置controller存放目录，用于进行controller自动载入与注册使用
  // 支持字符串或者字符串数组
  cwd: [
    path.resolve('./global'),
    path.resolve('./controllers'),
  ],
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
  // 热更新配置：改动接口代码无需重启，直接更新，推荐当前配置，仅在开发环境下使用
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
  // 热更新配置：改动接口代码无需重启，直接更新，推荐当前配置，仅在开发环境下使用
  hot: {
    // 配置热更新监听的目录
    cwd: path.resolve('./'),
  },
  // 配置controller存放目录，用于进行controller自动载入与注册使用
  cwd: path.resolve('./controllers'),
}));
```

## Controller 控制器

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

## Route 路由映射

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

## Arguments 参数提取

我们可以通过以下几个注解来定义请求参数的提取方式。

- `@RequestParam` 提取类型为`urleoncoded`的参数

- `@RequestBody` 提取整个`body`内容，通常是提取成为一个`json`对象

- `@PathVariable` 提取路由中的占位参数

- `@RequestHeader` 提取请求头中的指定名的请求头做为参数

- `@ServletRequest` 用于提取`request` 对象

- `@ServletResponse` 用于提取`response` 对象

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

> 例如： 将url中传递过来的`userName`值提取给`index`中的 `name`参数

```js
@RequestMapping('/home')
class HomeController { 

  @GetMapping('/index')
  index(@RequestParam({ value:'userName', required:true }) name){
    return `Hi ${name}, i am home index`;
  }
}
```

文件上传参数提取

```js
import { MultipartFile } from 'node-web-mvc';

@Api({ description:'上传' })
@RequestMapping('/upload')
class HomeController { 

  // 单个文件上传
  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  // 配置swagger 生成上传表单
  @ApiImplicitParams([
    { name: 'files', value: '证书', required: true, dataType: 'file' },
    { name: 'id', value: '用户id', required: true },
  ])
  @PostMapping({ value: '/file', produces: 'application/json' })
  async index(@RequestParam file: MultipartFile,@RequestParam id){
    // 保存文件
    await file.transferTo('appdata/images/' + file.name);

    return {
      code:0,
      message:'上传成功'
    }
  }

  // 多个文件上传
  @PostMapping({ value: '/files', produces: 'application/json' })
  async index(@RequestParam files: Array<MultipartFile>){
    // 保存文件
    for (let file of files) {
      await file.transferTo('appdata/images/' + file.name)
    }

    return {
      code:0,
      message:'上传成功'
    }
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

## Responsee 返回内容

在控制器具体函数中，我们可以返回以下几种类型来将内容返回到客户端。

- InterruptModel 返回空内容，如果是使用express 则和`next`函数类似

- ModelAndView 返回一个视图

- String 返回一个字符串

- Object 如果需要正常返回，需要通过`RequestMapping`指定produces为`application/json`

- Promise 返回一个异步结果

- Middlewares 返回一个类express的中间件执行结果

```js
import { RequestMapping, GetMapping, Middlewares } from 'node-web-mvc';

@RequestMapping('/home')
class HomeController {

  @GetMapping('/index')
  index(){
    return new Middlewares([
      (req,resp,next)=> next()
    ])
  }
}


```

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


## 异常处理

框架可以通过以下两个注解来进行控制器异常处理

- `ExceptionHandler`

- `ControllerAdvice` 

### ExceptionHandler

如果将`ExceptionHandler`标注在控制器的函数上，则表示当前控制器的函数执行异常时，会使用当前标注的函数来进行异常处理。

```js
import { GetMapping, RequestMapping, ExceptionHandler } from 'node-web-mvc';

@RequestMapping('/home')
export default class HomeController {

  @GetMapping('/index')
  index(){
    throw new Error('error');
  }

  @ExceptionHandler
  handleException(error){
    // 返回一个 json 异常对象
    return { code:error.code,message:error.message };
  }
}
```
### ControllerAdvice

利用`ControllerAdvice` 来进行全局异常控制

定义一个异常处理类，然后使用`ControllerAdvice`标注当前类为全局控制器处理，

最后在该类上定义一个异常处理函数，然后通过`ExceptionHandler`标注成异常处理函数。

例如:

> AppException.ts

```js

@ControllerAdvice
class AppException {

  @ExceptionHandler
  handleException(error){
    // 返回一个 json 异常对象
    return { code:error.code,message:error.message };
  }
}
```

## Resource 静态资源

框架也提供了静态资源服务，以及针对静态资源设定缓存策略等,同时也支持`gzip`压缩处理。

```js
import { Registry } from 'node-web-mvc';

// 启动Mvc  
Registry.launch({
  resource:{
    gzipped:true,// 默认不开启gzip
    // 默认可不填写，默认值为: 
    // application/javascript,text/css,application/json,application/xml,text/html,text/xml,text/plain
    mimeTypes:'text/css,text/html', 
  },
  addResourceHandlers(registry){
    registry
      .addResourceHandler('/swagger-ui/**')
      .addResourceLocations('/a/b/swagger-ui/')
      .setCacheControl({ maxAge:0 })
      // .addResolver(new CustomResolver())
  }
});

```

### 自定义ResourceResolver

...



## View 视图

框架默认不具备视图渲染功能，不过我们可以自定义视图解析器来支持渲染像`ejs` ,`handlebars`等类型的视图。

####  第一步 实现一个ejs 视图(`View`) 

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

####  第二步 实现一个ejs视图解析器

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

#### 第三步 注册ejs视图解析器

启动时通过`addViewResolvers`配置来注册视图解析器。

```js
import { Registry } from 'node-web-mvc';

// 启动Mvc  
Registry.launch({
  // ... 其他配置
  // 通过配置，来注册ejs视图解析器s
  addViewResolvers(registry) {
    // 注册ejs视图解析器
    registry.addViewResolver(new EjsViewResolver('test/WEB-INF/', '.ejs'))
  }
});
```

## Interceptor 拦截器

框架同时也内置了拦截器，我们可以通过自定义拦截器来完成一些请求的前置，以及后置处理。


### 自定义权限校验拦截器

#### 第一步 

通过继承于`HandlerInterceptorAdapter`来实现一个拦截器

> AuthorizationInterceptor.ts

```js
import { HandlerInterceptorAdapter } from 'node-web-mvc';

export default class AuthorizationInterceptor extends HandlerInterceptorAdapter {
 /**
   * 在处理action前，进行请求预处理
   * @param { HttpRequest } request 当前请求对象
   * @param { HttpResponse } response 当前响应对象
   * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
   * @returns { boolean }
   *   返回值：true表示继续流程（如调用下一个拦截器或处理器）；false表示流程中断（如登录检查失败），不会继续调用其他的拦截器或处理器，此时我们需要通过response来产生响应；
   */
  preHandle(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod): boolean {
    // 假设我们添加了一个UserLogin注解
    const annotation = handler.getAnnotation(UserLogin);
    if (annotation) {
      const nativeAnnotation = annotation.nativeAnnotation;
      // 进行权限校验
    }
    return true;
  }

  /**
   * 在处理完action后的拦截函数，可对执行完的接口进行处理
   * @param { HttpRequest } request 当前请求对象
   * @param { HttpResponse } response 当前响应对象
   * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
   * @param { any } result 执行action返回的结果
   */
  postHandle(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod, result): void {
  }

  /**
   * 在请求结束后的拦截器 （无论成功还是失败都会执行此拦截函数)
   * （这里可以用于进行资源清理之类的工作）
   * @param { HttpRequest } request 当前请求对象
   * @param { HttpResponse } response 当前响应对象
   * @param { ControllerContext } handler  当前拦截待执行的函数相关信息
   * @param { any } ex 如果执行action出现异常时，此参数会有值
   */
  afterCompletion(request: HttpServletRequest, response: HttpServletResponse, handler: HandlerMethod, ex): void {
  }
}

```

#### 第二步 

启动时通过`addInterceptors`配置来注册拦截器。

```js
import { Registry } from 'node-web-mvc';
import AuthorizationInterceptor from './interceptors/AuthorizationInterceptor';

// 启动Mvc  
Registry.launch({
  // ... 其他配置
  // 通过配置来注册拦截器
  addInterceptors(registry) {
    registry.addInterceptors(new AuthorizationInterceptor())

    // registry
    //   .addInterceptors(new AuthorizationInterceptor())
    //   .excludePathPatterns('/root/a','/root/b')
    //   .addPathPatterns('/root')
  }
});
```

## HttpMessageConverter 内容转换

框架内置了以下几种类型的请求内容转换

- JsonMessageConverter 将`application/json`的http.body正文转换成`json`对象.

- UrlencodedMessageConverter 用于转换类型为`application/x-www-form-urlencoded`的请求内容。

- MultipartMessageConverter 用于转换类型为`multipart/form-data`的请求内容

如果您需要处理其他类型的请求内容，可以自定义一个转换器

### 自定义Http转换器

#### 第一步

通过实现`HttpMessageConverter`接口来实现一个转换器

> XmlHttpMessageConverter.ts

```js
import { MediaType, ServletContext, HttpMessageConverter,RequestMemoryStream } from 'node-web-mvc';
import xml2js from 'xml2js';

export default class XmlHttpMessageConverter implements HttpMessageConverter {
  /**
   * 判断当前转换器是否能处理当前内容类型
   * @param mediaType 当前内容类型 例如: application/xml
   */
  canRead(mediaType: MediaType): boolean {
    return mediaType.name === 'application/xml';
  }

  /**
   * 判断当前内容是否能写
   * @param mediaType 当前内容类型 例如: application/xml
   */
  canWrite(mediaType: MediaType): boolean {
    return mediaType.name === 'application/xml';
  }

  // getSupportedMediaTypes(): Array<string>

  /**
   * 读取当前消息内容
   * @param servletRequest
   */
  read(servletContext: ServletContext, mediaType: MediaType): any {
    return new Promise((resolve, reject) => {
      new RequestMemoryStream(servletContext.request, (buffers) => {
        xml2js.parseString(buffers.toString('utf8'), (err, data) => {
          err ? reject(err) : resolve(data);
        });
      });
    })
  }

  /**
   * 写出当前内容
   * @param data 当前数据
   * @param mediaType 当前内容类型
   * @param servletContext 当前请求上下文
   */
  write(data: any, mediaType: MediaType, servletContext: ServletContext) {
    return new Promise((resolve) => {
      const builder = new xml2js.Builder();
      const xml = builder.buildObject(data);
      servletContext.response.write(xml, resolve);
    })
  }
}
```

#### 第二步

通过`addMessageConverters`将`XmlHttpMessageConverter`进行注册。

> Launch.ts

```js
import { Registry } from 'node-web-mvc';
import XmlHttpMessageConverter from './interceptors/XmlHttpMessageConverter';

// 启动Mvc  
Registry.launch({
  // ... 其他配置
  // 注册XmlHttpMessageConverter
  addMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  }
});

```

#### 第三步

这样就可以在控制器中使用了

> DataController.ts

```js
import { RequestMapping, PostMapping, RequestBody } from 'node-web-mvc';

@RequestMapping('/data')
export default class DataController {

  // 这里：同时测试 读取xml 以及返回xml
  @PostMapping({ value: '/receieve', consumes: 'application/xml', produces: 'application/xml' })
  receieve(@RequestBody data){
    console.log('xml data',data);
    return data;
  }
}
```

## ArgumentResolver  参数解析

框架内置了以下几种类型的请求参数解析

- `@RequestParam` 提取类型为`urleoncoded`的参数

- `@RequestBody` 提取整个`body`内容，通常是提取成为一个`json`对象

- `@PathVariable` 提取路由中的占位参数

- `@RequestHeader` 提取请求头中的指定名的请求头做为参数

- `@ServletRequest` 用于提取`request` 对象

- `@ServletResponse` 用于提取`response` 对象

如果您需要处理其他类型的请求内容，可以自定义一个参数解析器

### 自定义参数解析器

例如，以下实现通过 `UserId` 注解来提取当前登录用户id。

#### 第一步

定义一个`UserId`注解

> UserId.ts

```js
import { Target } from 'node-web-mvc';

@Target
class UserId {
  constructor(){
    // 注解构造函数
  }
}

// 公布注解
export default Target.install<typeof UserId>(UserId);
```


#### 第二步

通过实现`HandlerMethodArgumentResolver`接口来实现一个解析器

> UserIdArgumentResolver.ts 

```js
import { ServletContext,MethodParameter, HandlerMethodArgumentResolver } from 'node-web-mvc';
import UserIdAnnotation from './UserIdAnnotation';

export default class UserIdArgumentResolver implements HandlerMethodArgumentResolver {

  supportsParameter(paramater: MethodParameter, servletContext: ServletContext) {
    return paramater.hasParameterAnnotation(UserIdAnnotation)
  }

  resolveArgument(parameter: MethodParameter, servletContext: ServletContext): any {
    const cookies = servletContext.request.cookies;
    const token = cookies.token;
    // 从token中解析出用户id
    return TokenService.decode(token).userId;
  }
}
```

#### 第三步

通过`addArgumentResolvers`将`PathVariableMapMethodArgumentResolver`进行注册。

```js
import { Registry } from 'node-web-mvc';
import UserIdArgumentResolver from './UserIdArgumentResolver';

// 启动Mvc  
Registry.launch({
  // ... 其他配置
  // 注册
  addArgumentResolvers(resolvers) {
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  }
});

```

#### 第四步

这样就可以在控制器中使用了

```js
import { RequestMapping, PostMapping } from 'node-web-mvc';
import UserId from './UserId';

@RequestMapping('/data')
export default class DataController {

  @PostMapping('/home')
  receieve(@UserId id){
    console.log('id',id);
  }
}
```

## 热更新

在启动时，可通过配置`hot`配置启用热更新服务，

在热更新服务下，控制器代码以及及依赖模块改动，无需重启服务器。

### hot.preload

在修改一个文件时，会触发热更，在执行热更新前，会触发`preload`,如果您希望
您的某个依赖模块需要进行特定处理，则可以再该文件中订阅`hot.preload`

> 例如: ControllerFactory.ts 再一些控制器模块修改时，需要进行一些前置处理

```js
import { hot } from 'node-web-mvc';

// 订阅preload
hot.create(module).preload((old) => {
  // old 为当前即将进行热更新的模块旧模块，此时可以根据old来进行一些清理操作
})
```

### hot.accept

在模块热更新后，同此此函数来接受更新

```js
import { hot } from 'node-web-mvc';

// 订阅preload
hot.create(module).preload((new,old) => {
  // new 为当前热更新后的新模块对象
  // old 为热更新前的模块对象
})
```

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

> 如果不需要配置参数详细设定，一般可以不使用`ApiImplicitParams` 因为框架会自动根据每个参数的提取类型来自动生成swagger参数配置。

```js
@Api({ description: '首页控制器' })
class HomeConntroller {

  @ApiOperation({ value: '首页列表数据', notes: '这是备注',returnType:'返回数据类型' })
  @GetMapping('/index')
  index(){
  }

  @ApiOperation({ value: '上传文件', notes: '上传证书文件' })
  @ApiImplicitParams([
    { value: 'file', desc: '证书', required: true, dataType: MultipartFile },
    { value: 'desc', desc: '描述', required: true, paramType: 'formData' },
    { value: 'id', desc: '用户id', required: true }
  ])
  @PostMapping('/upload')
  upload(file: MultipartFile,@RequestParam desc,@RequestParam id) {
    return file.transferTo('appdata/images/' + file.name);
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

## 如何定制一个上下文

通过上述文档，我们知道，框架默认支持`node`原生,`express`以及`koa` 三种启动方式，如果您希望框架接入到node的其他`web`框架中，

书写一个继承于`ServletContext`的启动上下文类可。


#### 第一步

定义一个新的下文类

例如: 内部的实现的`express`启动上下文

> ServletExpressContext.ts

```js
/**
 * @module ServletExpressContext
 * @description 用于实现在express框架下运行mvc的请求上下文
 */
import { ServletContext } from 'node-web-mvc';

export default class ServletExpressContext extends ServletContext {
  /**
   * 用于接入要实现的目标平台的启动入口，主要用于
   * 返回一个启动中间件函数，通过返回的来获取到 request response next
   * 然后调用 callback(request,response,next) 即可
   * @param callback 
   */
  static launch(callback) {
    return function (request:IncomingMessage, response:ServerResponse, next) {
      // 需要保证:
      //   1. request为node原生http的 IncomingMessage 
      //   2. response为node原生http的 ServerResponse
      callback(request, response, next);
    }
  }
}
```

#### 第二步

将书写的上下文，注册到启动器中。

```js
import { Registry } from 'node-web-mvc';
import ServletExpressContext from './ServletExpressContext';

// 注册一个express上下文
Registry.register('express', ServletExpressContext);

// 接下来启动时将 mode设置成 express 就可以了
Registry.launch({
  mode:'express'
});
```

## 类型定义

### WebAppConfigurerOptions

```js
class WebAppConfigurerOptions {
  // 端口
  port?: number
  // 当前类型
  mode: RunMode
  // 是否开启swagger文档
  swagger?: boolean
  // 静态资源配置
  resource?: ResourceOptions
  // 基础路径
  base?: string
  // 配置请求内容大小
  multipart?: Multipart
  // 存放控制器的根目录
  cwd: string | Array<string>
  // 热更新配置
  hot?: HotOptions
  // 注册拦截器
  addInterceptors?: (registry: HandlerInterceptorRegistry) => void
  // 添加http消息转换器
  addMessageConverters?: (converters: MessageConverter) => void
  // 添加参数解析器
  addArgumentResolvers?: (resolvers: ArgumentsResolvers) => void
  // 添加视图解析器
  addViewResolvers?: (registry: ViewResolverRegistry) => void
  // 添加静态资源处理器
  addResourceHandlers?: (registry: ResourceHandlerRegistry) => void
  // 配置路径匹配
  configurePathMatch?: (configurer: PathMatchConfigurer) => void
  // 应用监听端口，且已启动
  onLaunch?: () => any
}
```

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
