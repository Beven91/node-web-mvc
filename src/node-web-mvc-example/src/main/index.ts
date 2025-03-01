import { SpringApplication, SpringBootApplication } from 'node-web-mvc';

@SpringBootApplication({
  hot: './',
  swagger: true,
  server: {
    port: 8088,
  },
  excludeScan: [ 'dist/', '/WEB-INF/', 'worker.ts', '' ],
  scanBasePackages: './',
})
export default class DemoApplication {
  static async main() {
    await SpringApplication.run(DemoApplication);
    console.log('costs: bbbbbbb', performance.now() - (global as any).NODE_MVC_STARTER_TIME);
  }
}
