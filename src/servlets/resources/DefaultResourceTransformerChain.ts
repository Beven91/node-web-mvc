/**
 * @module ResourceTransformerChain
 */

import Resource from "./Resource";
import HttpServletRequest from "../http/HttpServletRequest";
import ResourceTransformer from "./ResourceTransformer";
import ResourceResolverChain from "./ResourceResolverChain";
import ResourceTransformerChain from "./ResourceTransformerChain";

export default class DefaultResourceTransformerChain implements ResourceTransformerChain {

  private resolveCahin: ResourceResolverChain

  private tramformer: ResourceTransformer

  private nextChain: ResourceTransformerChain

  private get invokeable() {
    return this.tramformer != null && this.nextChain != null;
  }

  constructor(resolveChain: ResourceResolverChain, transformers: Array<ResourceTransformer> | ResourceTransformer, nextChain?: ResourceTransformerChain) {
    if (transformers instanceof Array) {
      let chain = new DefaultResourceTransformerChain(null, null);
      const elements = (transformers || []) as Array<ResourceTransformer>;
      elements.forEach((tramformer) => {
        chain = new DefaultResourceTransformerChain(resolveChain, tramformer, chain);
      });
      this.tramformer = chain.tramformer;
      this.resolveCahin = chain.resolveCahin;
      this.nextChain = chain.nextChain;
    } else {
      this.resolveCahin = resolveChain;
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