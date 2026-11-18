import HttpMethod from '../../../../node-web-mvc/src/servlets/http/HttpMethod';

describe('HttpMethod', () => {
  describe('枚举值', () => {
    it('所有标准 HTTP 方法值正确', () => {
      expect(HttpMethod.GET).toBe('GET');
      expect(HttpMethod.POST).toBe('POST');
      expect(HttpMethod.PUT).toBe('PUT');
      expect(HttpMethod.DELETE).toBe('DELETE');
      expect(HttpMethod.PATCH).toBe('PATCH');
      expect(HttpMethod.HEAD).toBe('HEAD');
      expect(HttpMethod.OPTIONS).toBe('OPTIONS');
    });

    it('包含恰好 7 个方法', () => {
      const values = Object.values(HttpMethod);
      expect(values).toHaveLength(7);
    });

    it('所有值都是大写字符串', () => {
      Object.values(HttpMethod).forEach(v => {
        expect(v).toBe(v.toUpperCase());
      });
    });
  });

  describe('HttpMethodKeys 类型等价性', () => {
    it('值与类型定义一致', () => {
      const validKeys = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      Object.values(HttpMethod).forEach(v => {
        expect(validKeys).toContain(v);
      });
    });
  });
});