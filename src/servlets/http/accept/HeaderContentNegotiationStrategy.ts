import HttpServletRequest from "../HttpServletRequest";
import MediaType from "../MediaType";
import ContentNegotiationStrategy from "./ContentNegotiationStrategy";

export default class HeaderContentNegotiationStrategy extends ContentNegotiationStrategy {
  resolveMediaTypes(request: HttpServletRequest): MediaType[] {
    const accept = request.headers['accept'] || '*/*';
    return accept.split(',').map((type) => new MediaType(type));
  }
}