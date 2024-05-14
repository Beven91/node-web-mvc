import path from 'path';
import OrderModel from './webapp/models/OrderModel';
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
    gzipped: true,
  }

  cwd = path.resolve('./test/webapp')

  addInterceptors(registry) {
    registry.addInterceptor(new AdminInterceptor());
    registry.addInterceptor(new EncodeInterceptor());
  }

  configureViewResolvers(registry: ViewResolverRegistry) {
    registry.viewResolver(new EjsViewResolver('test/webapp/WEB-INF/', '.ejs'))
  }

  addArgumentResolvers(resolvers) {
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  }

  extendMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  }

  addResourceHandlers(registry) {
    const dir = path.resolve('/Users/beven/Downloads');
    registry
      .addResourceHandler('/media/**')
      .addResourceLocations(dir);
  }

  configurePathMatch(configurer: PathMatchConfigurer) {
    configurer.setUrlPathHelper(new MyUrlPathHelper());
  }
}