import path from 'path';
import { ViewResolverRegistry, WebMvcConfigurationSupport } from "../src";
import AdminInterceptor from './webapp/interceptor/AdminInterceptor';
import EncodeInterceptor from './webapp/interceptor/EncodeInterceptor';
import EjsViewResolver from './webapp/resolvers/EjsViewResolver';
import XmlHttpMessageConverter from './webapp/converters/XmlHttpMessageConverter';
import UserIdArgumentResolver from './webapp/resolvers/UserIdArgumentResolver';
import PathMatchConfigurer from '../src/servlets/config/PathMatchConfigurer';
import MyUrlPathHelper from './webapp/globalization/MyUrlPathHelper';

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

  addViewResolvers(registry: ViewResolverRegistry) {
    registry.addViewResolver(new EjsViewResolver('test/webapp/WEB-INF/', '.ejs'))
  }

  addArgumentResolvers(resolvers) {
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  }

  addMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  }

  addResourceHandlers(registry) {
    registry
      .addResourceHandler('/aa/**')
      .addResourceLocations(path.join(__dirname, 'resources/aa'));
  }

  configurePathMatch(configurer: PathMatchConfigurer) {
    configurer.setUrlPathHelper(new MyUrlPathHelper());
  }
}
