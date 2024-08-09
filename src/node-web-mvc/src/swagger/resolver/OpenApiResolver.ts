import path from 'path';
import HttpServletRequest from '../../servlets/http/HttpServletRequest';
import Resource from '../../servlets/resources/Resource';
import ResourceHandlerRegistry from '../../servlets/resources/ResourceHandlerRegistry';
import ResourceResolver from '../../servlets/resources/ResourceResolver';
import ResourceResolverChain from '../../servlets/resources/ResourceResolverChain';
import OpenApiModel from '../openapi';
import ByteArrayResource from '../../servlets/resources/ByteArrayResource';
import MediaType from '../../servlets/http/MediaType';

export default class OpenApiResolver implements ResourceResolver {
  /**
 * 初始化swagger文档配置
 */
  static initializeResource(registry: ResourceHandlerRegistry, enable: boolean) {
    if (!enable) return;
    // 如果使用swagger
    const swaggerLocation = path.join(__dirname, '../../../swagger-ui/');
    registry
      .addResourceHandler('/swagger-ui/openapi.json')
      .resourceChain(false)
      .addResolver(new OpenApiResolver());

    registry
      .addResourceHandler('/swagger-ui/**')
      .addResourceLocations(swaggerLocation)
      .setCacheControl({ maxAge: 0 });
  }
  async resolveResource(request: HttpServletRequest, requestPath: string, locations: Resource[], next: ResourceResolverChain): Promise<Resource> {
    const builder = new OpenApiModel();
    const meta = builder.build(request.contextPath);
    const mediaType = MediaType.APPLICATION_JSON;
    const buffer = Buffer.from(JSON.stringify(meta, null, 2));
    const resource = new ByteArrayResource(buffer, mediaType);
    return resource;
  }

  resolveUrlPath(resourcePath: string, locations: Resource[], chain: ResourceResolverChain): Promise<string> {
    return chain.resolveUrlPath(resourcePath, locations);
  }
}
