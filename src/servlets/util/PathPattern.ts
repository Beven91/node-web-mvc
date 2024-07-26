import IllegalMappingPatternError from '../../errors/IllegalMappingPatternError';

const cache: Map<string, PathPattern> = new Map();

export default class PathPattern {
  /**
   * 以缓存方式创建一个路径模式匹配实例
   * @param pattern
   */

  static create(pattern: string): PathPattern {
    if (!cache.get(pattern)) {
      cache.set(pattern, new PathPattern(pattern));
    }
    return cache.get(pattern);
  }

  private readonly regexp: RegExp;

  private readonly pattern: string;

  private readonly parameters: Record<number, string>;

  constructor(pattern: string) {
    let parameterIndex = 1;
    this.pattern = pattern;
    this.parameters = {};
    const doubleWildIndex = pattern.indexOf('**');
    if (doubleWildIndex > -1 && doubleWildIndex !== pattern.length - 2) {
      throw new IllegalMappingPatternError(pattern);
    }
    const holder = String.fromCharCode(0);
    const express = pattern
      // 双通配符，需要支持 /多级匹配
      .replace(/\*\*/, holder)
      // 支持单通配符 *
      .replace(/\*/g, '[^/]*')
      // 支持变量 {id} {id:\\d+}
      .replace(/{([^}]+)}/g, (_, name: string) => {
        const [ key, content ] = name.split(':');
        this.parameters[parameterIndex++] = key;
        return `(${content || '[^/]*'})`;
      })
      .replace(holder, '.*');
    this.regexp = new RegExp(`^${express}$`);
  }

  match(path: string) {
    const result = { matched: false, params: {} };
    const values = path.match(this.regexp);
    values?.forEach((value, i) => {
      const name = this.parameters[i];
      if (name) {
        result.params[name] = value;
      }
    });
    result.matched = !!values;
    return result;
  }
}
