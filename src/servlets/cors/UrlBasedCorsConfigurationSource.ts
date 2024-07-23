import HttpServletRequest from "../http/HttpServletRequest";
import PathMatcher from "../util/PathMatcher";
import CorsConfiguration from "./CorsConfiguration";
import CorsConfigurationSource from "./CorsConfigurationSource";

export default class UrlBasedCorsConfigurationSource extends CorsConfigurationSource {

  private pathMatcher: PathMatcher

  private corsConfigurations: Map<string, CorsConfiguration>

  getCorsConfiguration(request: HttpServletRequest): CorsConfiguration {
    if (this.corsConfigurations?.size < 1) {
      return null;
    }
    for (const pathPattern of this.corsConfigurations.keys()) {
      if (this.pathMatcher.match(pathPattern, request.path)) {
        const config = this.corsConfigurations.get(pathPattern);
        return config;
      }
    }
  }


  setCorsConfigurations(config: Map<string, CorsConfiguration>) {
    this.corsConfigurations = config;
  }

  setPatchMatcher(pathMatcher: PathMatcher) {
    this.pathMatcher = pathMatcher;
  }
}