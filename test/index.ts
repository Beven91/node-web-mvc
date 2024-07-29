import { SpringApplication, SpringBootApplication } from '../src';

@SpringBootApplication({
  hot: './test',
  swagger: true,
  scanBasePackages: './test',
})
export default class DemoApplication {
  static async main() {
    await SpringApplication.run(DemoApplication);
  }
}
