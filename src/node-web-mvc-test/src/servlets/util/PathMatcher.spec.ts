import { PathMatcher } from 'node-web-mvc';
import PathPattern from '../../../../node-web-mvc/src/servlets/util/PathPattern';

describe('PathPattern', () => {
  describe('match - 精确匹配', () => {
    it('完全相同的路径匹配成功', () => {
      const p = PathPattern.create('/api/user');
      const r = p.match('/api/user');
      expect(r.matched).toBe(true);
    });

    it('不同路径匹配失败', () => {
      const p = PathPattern.create('/api/user');
      const r = p.match('/api/order');
      expect(r.matched).toBe(false);
    });
  });

  describe('match - 单通配符 *', () => {
    it('* 匹配任意单级路径段', () => {
      const p = PathPattern.create('/api/*');
      expect(p.match('/api/user').matched).toBe(true);
      expect(p.match('/api/order').matched).toBe(true);
    });

    it('* 不匹配多级路径', () => {
      const p = PathPattern.create('/api/*');
      expect(p.match('/api/user/detail').matched).toBe(false);
    });
  });

  describe('match - 双通配符 **', () => {
    it('** 匹配多级路径', () => {
      const p = PathPattern.create('/api/**');
      expect(p.match('/api/user/detail').matched).toBe(true);
      expect(p.match('/api/a/b/c/d').matched).toBe(true);
    });

    it('** 要求至少有一级路径', () => {
      const p = PathPattern.create('/api/**');
      expect(p.match('/api').matched).toBe(false);
      expect(p.match('/api/').matched).toBe(true);
      expect(p.match('/api/user').matched).toBe(true);
    });

    it('** 只能出现在末尾', () => {
      expect(() => PathPattern.create('/api/**/detail')).toThrow();
    });
  });

  describe('match - 路径变量 {name}', () => {
    it('{id} 提取路径变量', () => {
      const p = PathPattern.create('/user/{id}');
      const r = p.match('/user/123');
      expect(r.matched).toBe(true);
      expect(r.params).toEqual({ id: '123' });
    });

    it('多个变量', () => {
      const p = PathPattern.create('/api/{version}/users/{userId}');
      const r = p.match('/api/v1/users/456');
      expect(r.matched).toBe(true);
      expect(r.params).toEqual({ version: 'v1', userId: '456' });
    });

    it('变量含正则约束 {id:\\d+}', () => {
      const p = PathPattern.create('/user/{id:\\d+}');
      expect(p.match('/user/123').matched).toBe(true);
      expect(p.match('/user/abc').matched).toBe(false);
    });
  });

  describe('match - 混合模式', () => {
    it('* 与变量混用', () => {
      const p = PathPattern.create('/api/*/{id}');
      const r = p.match('/api/user/42');
      expect(r.matched).toBe(true);
      expect(r.params).toEqual({ id: '42' });
    });
  });

  describe('缓存', () => {
    it('相同 pattern 返回同一实例', () => {
      const a = PathPattern.create('/test/cache');
      const b = PathPattern.create('/test/cache');
      expect(a).toBe(b);
    });
  });
});

describe('PathMatcher', () => {
  const matcher = new PathMatcher();

  describe('match', () => {
    it('匹配成功返回 true', () => {
      expect(matcher.match('/api/user', '/api/user')).toBe(true);
    });

    it('匹配失败返回 false', () => {
      expect(matcher.match('/api/user', '/api/order')).toBe(false);
    });

    it('支持通配符', () => {
      expect(matcher.match('/api/**', '/api/user/detail')).toBe(true);
    });
  });

  describe('matchOne', () => {
    it('数组中任一匹配即返回 true', () => {
      expect(matcher.matchOne([ '/api/**' ], '/api/user')).toBeTruthy();
    });

    it('全不匹配返回 false', () => {
      expect(matcher.matchOne([ '/order/**', '/product/**' ], '/api/user')).toBeFalsy();
    });

    it('null 数组返回 false', () => {
      expect(matcher.matchOne(null as any, '/api/user')).toBe(false);
    });
  });
});
