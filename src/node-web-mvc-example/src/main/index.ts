import { SpringApplication, SpringBootApplication } from 'node-web-mvc';

@SpringBootApplication({
  hot: './',
  swagger: true,
  server: {
    port: 8088,
  },
  scanBasePackages: './',
})
export default class DemoApplication {
  static async main() {
    await SpringApplication.run(DemoApplication);
    console.log('costs:', performance.now() - (global as any).xx);
  }
}
