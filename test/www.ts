
// import express from 'express';
import path from 'path';
import { Registry } from '../src/index';
import AdminInterceptor from './webapp/interceptor/AdminInterceptor';
import EncodeInterceptor from './webapp/interceptor/EncodeInterceptor';
import EjsViewResolver from './webapp/resolvers/EjsViewResolver';
import XmlHttpMessageConverter from './webapp/converters/XmlHttpMessageConverter';
import UserIdArgumentResolver from './webapp/resolvers/UserIdArgumentResolver';

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
  resource: {
    gzipped: false,
  },
  cwd: path.resolve('./test/webapp'),
  addInterceptors: (registry) => {
    registry.addInterceptor(new AdminInterceptor());
    registry.addInterceptor(new EncodeInterceptor());
  },
  configureViewResolvers(registry) {
    registry.viewResolver(new EjsViewResolver('test/WEB-INF/', '.ejs'))
  },
  addArgumentResolvers(resolvers) {
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  },
  extendMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  },
  addResourceHandlers(registry){
    console.log('=================>')
    registry.addResourceHandler('/aa/**').addResourceLocations(path.resolve('swagger-ui'));
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