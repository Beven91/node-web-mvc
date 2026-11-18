import CorsConfiguration from '../../../../node-web-mvc/src/servlets/cors/CorsConfiguration';

describe('CorsConfiguration', () => {
  describe('构造', () => {
    it('默认构造', () => {
      const config = new CorsConfiguration();
      expect(config.origins).toEqual([]);
      expect(config.allowedHeaders).toEqual([]);
      expect(config.methods).toEqual([]);
    });

    it('传入 options', () => {
      const config = new CorsConfiguration({
        origins: [ 'http://localhost:3000' ],
        allowedHeaders: [ 'Content-Type' ],
        methods: [ 'GET', 'POST' ],
      });
      expect(config.origins).toEqual([ 'http://localhost:3000' ]);
      expect(config.allowedHeaders).toEqual([ 'Content-Type' ]);
      expect(config.methods).toEqual([ 'GET', 'POST' ]);
    });
  });

  describe('addAllowedOrigin', () => {
    it('添加 origin', () => {
      const config = new CorsConfiguration();
      config.addAllowedOrigin('http://example.com');
      expect(config.origins).toContain('http://example.com');
    });

    it('去除末尾 /', () => {
      const config = new CorsConfiguration();
      config.addAllowedOrigin('http://example.com/');
      expect(config.origins).toContain('http://example.com');
    });

    it('falsy 值不添加', () => {
      const config = new CorsConfiguration();
      config.addAllowedOrigin('');
      config.addAllowedOrigin(null as any);
      expect(config.origins.length).toBe(0);
    });
  });

  describe('addAllowedMethod', () => {
    it('添加方法', () => {
      const config = new CorsConfiguration();
      config.addAllowedMethod('GET');
      expect(config.methods).toContain('GET');
    });

    it('falsy 不添加', () => {
      const config = new CorsConfiguration();
      config.addAllowedMethod('');
      expect(config.methods.length).toBe(0);
    });
  });

  describe('addAllowedHeader', () => {
    it('添加 header', () => {
      const config = new CorsConfiguration();
      config.addAllowedHeader('X-Custom');
      expect(config.allowedHeaders).toContain('X-Custom');
    });
  });

  describe('addAllowedOriginPattern', () => {
    it('添加正则', () => {
      const config = new CorsConfiguration();
      config.addAllowedOriginPattern(/https:\/\/.*\.example\.com/);
      expect(config.originPatterns.length).toBe(1);
    });
  });

  describe('checkOrigin', () => {
    it('精确匹配返回原 origin', () => {
      const config = new CorsConfiguration({ origins: [ 'http://example.com' ] });
      expect(config.checkOrigin('http://example.com')).toBe('http://example.com');
    });

    it('通配符 * 匹配返回 *', () => {
      const config = new CorsConfiguration({ origins: [ '*' ] });
      expect(config.checkOrigin('http://any.com')).toBe('*');
    });

    it('不匹配返回 null', () => {
      const config = new CorsConfiguration({ origins: [ 'http://foo.com' ] });
      expect(config.checkOrigin('http://bar.com')).toBeNull();
    });

    it('空 origin 返回 null', () => {
      const config = new CorsConfiguration({ origins: [ '*' ] });
      expect(config.checkOrigin(null as any)).toBeNull();
      expect(config.checkOrigin('')).toBeNull();
    });

    it('正则匹配', () => {
      const config = new CorsConfiguration({ originPatterns: [ /https:\/\/.*\.example\.com/ ] });
      expect(config.checkOrigin('https://sub.example.com')).toBe('https://sub.example.com');
    });

    it('去除末尾 /', () => {
      const config = new CorsConfiguration({ origins: [ 'http://example.com' ] });
      // checkOrigin 内部会 strip 末尾 / 用来匹配，但返回的是原始 origin
      expect(config.checkOrigin('http://example.com/')).toBe('http://example.com/');
    });
  });

  describe('checkHttpMethod', () => {
    it('methods 为空时返回请求方法', () => {
      const config = new CorsConfiguration();
      const result = config.checkHttpMethod('GET');
      expect(result).toEqual([ 'GET' ]);
    });

    it('匹配返回所有方法', () => {
      const config = new CorsConfiguration({ methods: [ 'GET', 'POST' ] });
      const result = config.checkHttpMethod('GET');
      expect(result).toEqual([ 'GET', 'POST' ]);
    });

    it('不匹配返回 undefined', () => {
      const config = new CorsConfiguration({ methods: [ 'GET' ] });
      expect(config.checkHttpMethod('POST')).toBeUndefined();
    });

    it('空方法返回 null', () => {
      const config = new CorsConfiguration();
      expect(config.checkHttpMethod('')).toBeNull();
    });
  });

  describe('checkHeaders', () => {
    it('通配符返回所有请求头', () => {
      const config = new CorsConfiguration({ allowedHeaders: [ '*' ] });
      const result = config.checkHeaders([ 'X-Custom', 'Authorization' ]);
      expect(result).toEqual([ 'X-Custom', 'Authorization' ]);
    });

    it('精确匹配', () => {
      const config = new CorsConfiguration({ allowedHeaders: [ 'X-Custom' ] });
      const result = config.checkHeaders([ 'X-Custom' ]);
      expect(result).toEqual([ 'X-Custom' ]);
    });

    it('不匹配返回 null', () => {
      const config = new CorsConfiguration({ allowedHeaders: [ 'X-Custom' ] });
      expect(config.checkHeaders([ 'Authorization' ])).toBeNull();
    });

    it('空 headers 返回空数组', () => {
      const config = new CorsConfiguration();
      expect(config.checkHeaders([])).toEqual([]);
    });

    it('null headers 返回 null', () => {
      const config = new CorsConfiguration();
      expect(config.checkHeaders(null as any)).toBeNull();
    });
  });

  describe('validate', () => {
    it('allowCredentials + * 抛异常', () => {
      const config = new CorsConfiguration({ origins: [ '*' ], allowCredentials: true });
      expect(() => config.validate()).toThrow('allowCredentials');
    });

    it('allowPrivateNetwork + * 抛异常', () => {
      const config = new CorsConfiguration({ origins: [ '*' ], allowPrivateNetwork: true });
      expect(() => config.validate()).toThrow('allowPrivateNetwork');
    });

    it('allowCredentials + 具体 origin 不抛异常', () => {
      const config = new CorsConfiguration({ origins: [ 'http://example.com' ], allowCredentials: true });
      expect(() => config.validate()).not.toThrow();
    });
  });

  describe('combine', () => {
    it('合并两个配置', () => {
      const c1 = new CorsConfiguration({ origins: [ 'http://a.com' ], methods: [ 'GET' ] });
      const c2 = new CorsConfiguration({ origins: [ 'http://b.com' ], methods: [ 'POST' ] });
      const result = c1.combine(c2);
      expect(result.origins).toContain('http://a.com');
      expect(result.origins).toContain('http://b.com');
      expect(result.methods).toContain('GET');
      expect(result.methods).toContain('POST');
    });

    it('other 为 null 返回自身', () => {
      const c1 = new CorsConfiguration();
      expect(c1.combine(null as any)).toBe(c1);
    });
  });

  describe('applyPermitDefaultValues', () => {
    it('空配置添加默认值', () => {
      const config = new CorsConfiguration();
      config.applyPermitDefaultValues();
      expect(config.origins).toEqual([ '*' ]);
      expect(config.allowedHeaders).toEqual([ '*' ]);
      expect(config.maxAge).toBe(1800);
    });
  });
});
