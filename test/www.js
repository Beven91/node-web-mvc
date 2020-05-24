const express = require('express');
const path = require('path');
const { Registry, ControllerFactory, Routes } = require('../index');

const port = 9800;
const app = express();

require('@babel/register')({
  presets: [
    "module:metro-react-native-babel-preset"
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
  ]
})

//注册api/controllers目录下的所有controller
ControllerFactory.registerControllers(path.resolve('./controllers'));

// 或者可以设置自定义的控制器工厂
// ControllerFactory.defaultFactory = new ControllerFactory();

//设置默认路由
//推荐：最好把以下代码放到所有路由配置的最后，以降低其优先级，防止吞掉其他指定的路由
Routes.mapRoute('{controller}/{action}', { controller: 'Home', action: 'index' });

// 启动Mvc  
app.use(Registry.launch({ mode: 'express' }));

app.listen(port, () => {
  console.log(`
  -------------------------------------
  ====> Start node-mvc
  ====> Enviroment: development
  ====> Listening: port ${port}
  ====> Url: http://localhost:${port}
  -------------------------------------
  `)
})