/**
 * @module ResourceTransformerChain
 */

import Resource from './Resource';
import HttpServletRequest from '../http/HttpServletRequest';

export default interface ResourceTransformerChain {

  transform(request: HttpServletRequest, resource: Resource): Promise<Resource>
}
