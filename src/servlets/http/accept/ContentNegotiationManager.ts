import HttpServletRequest from "../HttpServletRequest";
import ContentNegotiationStrategy, { MEDIA_TYPE_ALL_LIST } from "./ContentNegotiationStrategy";
import HeaderContentNegotiationStrategy from "./HeaderContentNegotiationStrategy";

export default class ContentNegotiationManager {

  private readonly strategies: ContentNegotiationStrategy[]

  constructor() {
    this.strategies = [
      new HeaderContentNegotiationStrategy()
    ]
  }

  resolveMediaTypes(request: HttpServletRequest) {
    for (const strategy of this.strategies) {
      const types = strategy.resolveMediaTypes(request);
      if (types == MEDIA_TYPE_ALL_LIST || types?.length < 1) {
        continue;
      }

      return types;
    }
    return MEDIA_TYPE_ALL_LIST;
  }

}