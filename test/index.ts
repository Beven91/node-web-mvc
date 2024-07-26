import { SpringApplication, SpringBootApplication } from '../src';

@SpringBootApplication({
  scanBasePackages: './test',
})
export default class DemoApplication {
  static main() {
    SpringApplication.run(DemoApplication);
  }
}
