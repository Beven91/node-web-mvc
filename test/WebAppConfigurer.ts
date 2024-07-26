import path from 'path';
import { CorsRegistry, HandlerInterceptorRegistry, ResourceHandlerRegistry, ViewResolverRegistry, WebMvcConfigurationSupport, Configuration } from '../src';
import AdminInterceptor from './webapp/interceptor/AdminInterceptor';
import EncodeInterceptor from './webapp/interceptor/EncodeInterceptor';
import EjsViewResolver from './webapp/resolvers/EjsViewResolver';
import XmlHttpMessageConverter from './webapp/converters/XmlHttpMessageConverter';
import UserIdArgumentResolver from './webapp/resolvers/UserIdArgumentResolver';
import PathMatchConfigurer from '../src/servlets/config/PathMatchConfigurer';
import MyUrlPathHelper from './webapp/globalization/MyUrlPathHelper';

@Configuration
export default class WebAppConfigurer extends WebMvcConfigurationSupport {
  resource = {
    gzipped: true,
  };

  addCorsMappings(registry: CorsRegistry): void {
    // registry
    //   .addMapping('/home/*')
    //   .allowedMethods('GET', 'POST', 'PUT')
    //   .allowedOrigins('*')
    //   .exposedHeaders('X-Custom-Header')
  }

  addInterceptors(registry: HandlerInterceptorRegistry): void {
    registry.addInterceptor(new AdminInterceptor());
    registry.addInterceptor(new EncodeInterceptor());
  }

  configureViewResolvers(registry: ViewResolverRegistry) {
    registry.viewResolver(new EjsViewResolver('test/webapp/WEB-INF/', '.ejs'));
  }

  addArgumentResolvers(resolvers) {
    resolvers.addArgumentResolvers(new UserIdArgumentResolver());
  }

  extendMessageConverters(converters) {
    converters.addMessageConverters(new XmlHttpMessageConverter());
  }

  addResourceHandlers(registry: ResourceHandlerRegistry): void {
    const dir = path.resolve('/Users/beven/Downloads');
    registry
      .addResourceHandler('/media/**')
      .addResourceLocations(dir);
  }


  configurePathMatch(configurer: PathMatchConfigurer) {
    configurer.setUrlPathHelper(new MyUrlPathHelper());
  }
}
