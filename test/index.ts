import { SpringApplication, SpringBootApplication } from '../src';

@SpringBootApplication({
  hot: './test',
  scanBasePackages: './test',
})
export default class DemoApplication {
  static main() {
    SpringApplication.run(DemoApplication);
  }
}
