
// import express from 'express';
import path from 'path';
import { Registry } from '../src/index';
import AdminInterceptor from './interceptor/AdminInterceptor';
import EncodeInterceptor from './interceptor/EncodeInterceptor';
import EjsViewResolver from './resolvers/EjsViewResolver';
import XmlHttpMessageConverter from './converters/XmlHttpMessageConverter';
import UserIdArgumentResolver from './resolvers/UserIdArgumentResolver';

const port = 9898;
// const app = express();

// app.use(express.static(path.resolve('')))

//注册api/controllers目录下的所有controller
// ControllerFactory.registerControllers(path.resolve('./test/controllers'));

// 或者可以设置自定义的控制器工厂
// ControllerFactory.defaultFactory = new ControllerFactory();

//设置默认路由
//推荐：最好把以下代码放到所有路由配置的最后，以降低其优先级，防止吞掉其他指定的路由
// Routes.mapRoute('{controller}/{action}', { controller: 'Home', action: 'index' });

// 启动Mvc  
Registry.launch({
  mode: 'node',
  port: port,
  hot: {
    cwd: path.resolve('./test'),
  },
  cwd: path.resolve('./test'),
  addInterceptors: (registry) => {
    registry.addInterceptor(new AdminInterceptor());
    registry.addInterceptor(new EncodeInterceptor());
  },
  addViewResolvers(registry) {
    registry.addViewResolver(new EjsViewResolver('test/WEB-INF/', '.ejs'))
  },
  addArgumentResolvers(resolvers){
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  },
  addMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  }
});

//   console.log(`
//   -------------------------------------
//   ====> Start node-mvc
//   ====> Enviroment: development
//   ====> Listening: port ${port}
//   ====> Url: http://localhost:${port}/swagger/index.html
//   -------------------------------------
//   `)
// })