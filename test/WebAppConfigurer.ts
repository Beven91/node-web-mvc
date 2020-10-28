import path from 'path';
import { WebMvcConfigurationSupport } from "../src";
import AdminInterceptor from './webapp/interceptor/AdminInterceptor';
import EncodeInterceptor from './webapp/interceptor/EncodeInterceptor';
import EjsViewResolver from './webapp/resolvers/EjsViewResolver';
import XmlHttpMessageConverter from './webapp/converters/XmlHttpMessageConverter';
import UserIdArgumentResolver from './webapp/resolvers/UserIdArgumentResolver';

export default class WebAppConfigurer extends WebMvcConfigurationSupport {

  mode = 'node'

  hot = {
    cwd: path.resolve('./test'),
  }

  resource = {
    gzipped: false,
  }

  cwd = path.resolve('./test/webapp')

  addInterceptors(registry) {
    registry.addInterceptor(new AdminInterceptor());
    registry.addInterceptor(new EncodeInterceptor());
  }

  addViewResolvers(registry) {
    registry.addViewResolver(new EjsViewResolver('test/WEB-INF/', '.ejs'))
  }

  addArgumentResolvers(resolvers) {
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  }

  addMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  }

  addResourceHandlers(registry) {
    registry.addResourceHandler('/aa/**').addResourceLocations(path.resolve('swagger-ui/aa'));
  }
}
