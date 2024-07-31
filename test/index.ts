import { SpringApplication, SpringBootApplication } from '../src';

@SpringBootApplication({
  hot: './test',
  swagger: true,
  server: {
    port: 8088,
  },
  scanBasePackages: './test',
})
export default class DemoApplication {
  static async main() {
    await SpringApplication.run(DemoApplication);
  }
}
