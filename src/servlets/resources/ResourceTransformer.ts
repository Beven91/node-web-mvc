import Resource from "./Resource";
import ResourceTransformerChain from "./ResourceTransformerChain";
import HttpServletRequest from "../http/HttpServletRequest";

/**
 * @module ResourceTransformer
 */

export default interface ResourceTransformer {

  transform(request: HttpServletRequest, resource: Resource, chain: ResourceTransformerChain): Promise<Resource>
}