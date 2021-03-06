import ResourceResolver from "./ResourceResolver";
import ResourceTransformer from "./ResourceTransformer";

/**
 * @module ResourceChainRegistration
 */

export default class ResourceChainRegistration {

  readonly resolvers: Array<ResourceResolver>;

  readonly transformers: Array<ResourceTransformer>

  constructor(cacheResources, cache) {
    this.resolvers = new Array<ResourceResolver>();
    this.transformers = new Array<ResourceTransformer>();
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