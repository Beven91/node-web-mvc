import HttpServletRequest from '../HttpServletRequest';
import MediaType from '../MediaType';

export const MEDIA_TYPE_ALL_LIST = [ MediaType.ALL ];

export default abstract class ContentNegotiationStrategy {
  abstract resolveMediaTypes(request: HttpServletRequest): MediaType[];
}
