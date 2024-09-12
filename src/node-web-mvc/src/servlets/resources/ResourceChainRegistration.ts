import Cache from '../http/Cache';
import ResourceResolver from './ResourceResolver';
import ResourceTransformer from './ResourceTransformer';

/**
 * @module ResourceChainRegistration
 */

export default class ResourceChainRegistration {
  readonly resolvers: Array<ResourceResolver>;

  readonly transformers: Array<ResourceTransformer>;

  constructor(cacheResources: boolean, cache?: Cache) {
    // 暂不实现CachingResourceResolver
    this.resolvers = [];
    this.transformers = [];
  }

  addResolver(resolver: ResourceResolver) {
    if (resolver) {
      this.resolvers.push(resolver);
    }
    return this;
  }

  addTransformer(transformer: ResourceTransformer) {
    if (transformer) {
      this.transformers.push(transformer);
    }
    return this;
  }
}
