/**
 * @module PathMatcher
 * @descriptionn 路径匹配器
 */
import PathPattern from "./PathPattern";

export interface MatchResult {
  params: object
}

export default class PathMatcher {
  /**
   * 匹配传入规则与路径
   * @param pattern 规则
   * @param path 路径
   */
  match(pattern: string, path: string): boolean {
    const r = this.matchPattern(pattern, path);
    return r !== null;
  }

  matchOne(patterns: string[], path: string) {
    if (null == patterns) return false;
    return patterns.find((pattern) => this.match(pattern, path));
  }

  /**
   * 匹配传入规则与路径，并且返回匹配结果信息，
   * 如果匹配失败，则返回 null
   * @param pattern 规则
   * @param path 路径
   */
  matchPattern(pattern: string, path: string): MatchResult {
    const result = PathPattern.create(pattern).match(path);
    return result.matched ? result : null;
  }

  static preBuildPattern(patterns: string[]) {
    patterns?.forEach?.((pattern) => {
      PathPattern.create(pattern);
    })
  }
}