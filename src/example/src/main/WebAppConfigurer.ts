import path from 'path';
import { CorsRegistry, HandlerInterceptorRegistry, PathMatchConfigurer, ResourceHandlerRegistry, ViewResolverRegistry, WebMvcConfigurationSupport, Configuration } from 'node-web-mvc';
import AdminInterceptor from './interceptor/AdminInterceptor';
import EncodeInterceptor from './interceptor/EncodeInterceptor';
import EjsViewResolver from './resolvers/EjsViewResolver';
import XmlHttpMessageConverter from './converters/XmlHttpMessageConverter';
import UserIdArgumentResolver from './resolvers/UserIdArgumentResolver';
import MyUrlPathHelper from './globalization/MyUrlPathHelper';

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
    registry.viewResolver(new EjsViewResolver('src/main/WEB-INF/', '.ejs'));
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
