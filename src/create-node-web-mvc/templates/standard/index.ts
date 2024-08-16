import { SpringApplication, SpringBootApplication } from 'node-web-mvc';

@SpringBootApplication({
  // 代码热更新： 在该目录下的文件改动支持热更新（无需重启服务) 注意：在process.env.NODE_ENV === 'production'时强制无效
  hot: './src',
  // 启动时需要加载的模块目录， 在不配置时默认为 process.cwd()
  scanBasePackages: './src',
  // 配置服务端口相关
  // server: { port: 8080  }
})
export default class DemoApplication {
  static main() {
    SpringApplication.run(DemoApplication);
  }
}
