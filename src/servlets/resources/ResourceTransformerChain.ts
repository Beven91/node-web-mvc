/**
 * @module ResourceTransformerChain
 */

import Resource from "./Resource";
import HttpServletRequest from "../http/HttpServletRequest";
import ResourceTransformer from "./ResourceTransformer";
import ResourceResolverChain from "./ResourceResolverChain";

export default class ResourceTransformerChain {

  private resolveCahin: ResourceResolverChain

  private tramformer: ResourceTransformer

  private nextChain: ResourceTransformerChain

  private get invokeable() {
    return this.tramformer != null && this.nextChain != null;
  }

  constructor(transformers: Array<ResourceTransformer> | ResourceTransformer, resolveCahin: ResourceResolverChain, nextChain?: ResourceTransformerChain) {
    if (transformers instanceof Array) {
      let chain = new ResourceTransformerChain(null, null);
      const elements = (transformers || []) as Array<ResourceTransformer>;
      elements.forEach((tramformer) => {
        chain = new ResourceTransformerChain(tramformer, resolveCahin);
      });
      this.tramformer = chain.tramformer;
      this.resolveCahin = chain.resolveCahin;
      this.nextChain = chain.nextChain;
    } else {
      this.resolveCahin = resolveCahin;
      this.tramformer = transformers;
      this.nextChain = nextChain;
    }
  }

  async transform(request: HttpServletRequest, resource: Resource): Promise<Resource> {
    if (!this.invokeable) {
      return resource;
    }
    return await this.tramformer.transform(request, resource, this.nextChain);
  }
}