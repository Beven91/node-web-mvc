import CacheControl from '../../../../node-web-mvc/src/servlets/http/CacheControl';

describe('CacheControl', () => {
  describe('toString', () => {
    it('maxAge=0 时输出 max-age=0（语义问题：0 应表示不缓存）', () => {
      // BUG: maxAge >= 0 判断导致 maxAge=0 时输出 max-age=0
      // 在 HTTP 语义中 max-age=0 表示"立即过期/不缓存"
      // 但如果用户未设置 maxAge（即 undefined），则 undefined >= 0 为 false 跳过
      // 所以这个边界：用户显式设置 maxAge=0 会导致输出，可能是预期行为
      const cc = new CacheControl({ maxAge: 0 } as CacheControl);
      expect(cc.toString()).toContain('max-age=0');
    });

    it('maxAge 为负数时不输出', () => {
      const cc = new CacheControl({ maxAge: -1 } as CacheControl);
      expect(cc.toString()).not.toContain('max-age');
      expect(cc.toString()).toBe('');
    });

    it('no-cache', () => {
      const cc = new CacheControl({ noCache: true } as CacheControl);
      expect(cc.toString()).toContain('no-cache');
    });

    it('no-store', () => {
      const cc = new CacheControl({ noStore: true } as CacheControl);
      expect(cc.toString()).toContain('no-store');
    });

    it('must-revalidate', () => {
      const cc = new CacheControl({ mustRevalidate: true } as CacheControl);
      expect(cc.toString()).toContain('must-revalidate');
    });

    it('no-transform', () => {
      const cc = new CacheControl({ noTransform: true } as CacheControl);
      expect(cc.toString()).toContain('no-transform');
    });

    it('public', () => {
      const cc = new CacheControl({ isPublic: true } as CacheControl);
      expect(cc.toString()).toContain('public');
    });

    it('private', () => {
      const cc = new CacheControl({ isPrivate: true } as CacheControl);
      expect(cc.toString()).toContain('private');
    });

    it('proxy-revalidate', () => {
      const cc = new CacheControl({ proxyRevalidate: true } as CacheControl);
      expect(cc.toString()).toContain('proxy-revalidate');
    });

    it('s-maxage', () => {
      const cc = new CacheControl({ sMaxAge: 600 } as CacheControl);
      expect(cc.toString()).toContain('s-maxage=600');
    });

    it('多个属性组合', () => {
      const cc = new CacheControl({ maxAge: 3600, isPublic: true, mustRevalidate: true } as CacheControl);
      const result = cc.toString();
      expect(result).toContain('max-age=3600');
      expect(result).toContain('public');
      expect(result).toContain('must-revalidate');
    });

    it('所有属性为 falsy 返回空字符串', () => {
      const cc = new CacheControl({} as CacheControl);
      expect(cc.toString()).toBe('');
    });
  });

  describe('构造', () => {
    it('所有属性正确赋值', () => {
      const cc = new CacheControl({
        maxAge: 600,
        noCache: true,
        isPublic: true,
        isPrivate: false,
      } as CacheControl);
      expect(cc.maxAge).toBe(600);
      expect(cc.noCache).toBe(true);
      expect(cc.isPublic).toBe(true);
      expect(cc.isPrivate).toBe(false);
    });
  });
});
