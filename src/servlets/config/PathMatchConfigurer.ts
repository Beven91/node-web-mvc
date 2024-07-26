
/**
 * @module PathMatchConfigurer
 * @description 路径匹配配置,可配置servlet路径解析，以及资源url解析
 */
import PathMatcher from '../util/PathMatcher';
import UrlPathHelper from '../util/UrlPathHelper';

export default class PathMatchConfigurer {
  private urlPathHelper: UrlPathHelper;

  private pathMatcher: PathMatcher;

  private defaultUrlPathHelper: UrlPathHelper;

  private defaultPathMatcher: PathMatcher;

  setUrlPathHelper(helper: UrlPathHelper) {
    this.urlPathHelper = helper;
  }

  setPathMatcher(matcher: PathMatcher) {
    this.pathMatcher = matcher;
  }

  getPathMatcherOrDefault(): PathMatcher {
    if (this.pathMatcher) {
      return this.pathMatcher;
    }
    if (!this.defaultPathMatcher) {
      this.defaultPathMatcher = new PathMatcher();
    }
    return this.defaultPathMatcher;
  }

  getUrlPathHelperOrDefault(): UrlPathHelper {
    if (this.urlPathHelper) {
      return this.urlPathHelper;
    }
    if (!this.defaultUrlPathHelper) {
      this.defaultUrlPathHelper = new UrlPathHelper();
    }
    return this.defaultUrlPathHelper;
  }
}
