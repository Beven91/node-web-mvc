import HttpStatus from '../../../../node-web-mvc/src/servlets/http/HttpStatus';

describe('HttpStatus', () => {
  describe('构造', () => {
    it('code 和 message 正确设置', () => {
      const status = new HttpStatus(200, 'OK');
      expect(status.code).toBe(200);
      expect(status.message).toBe('OK');
    });
  });

  describe('equals', () => {
    it('相同 code 返回 true', () => {
      expect(HttpStatus.OK.equals(HttpStatus.OK)).toBe(true);
    });

    it('不同 code 返回 false', () => {
      expect(HttpStatus.OK.equals(HttpStatus.NOT_FOUND)).toBe(false);
    });

    it('null/undefined 返回 false', () => {
      expect(HttpStatus.OK.equals(null as any)).toBe(false);
      expect(HttpStatus.OK.equals(undefined as any)).toBe(false);
    });
  });

  describe('静态状态码', () => {
    it('2xx 成功状态码', () => {
      expect(HttpStatus.OK.code).toBe(200);
      expect(HttpStatus.CREATED.code).toBe(201);
      expect(HttpStatus.NO_CONTENT.code).toBe(204);
    });

    it('3xx 重定向状态码', () => {
      expect(HttpStatus.MOVED_PERMANENTLY.code).toBe(301);
      expect(HttpStatus.FOUND.code).toBe(302);
    });

    it('4xx 客户端错误', () => {
      expect(HttpStatus.BAD_REQUEST.code).toBe(400);
      expect(HttpStatus.NOT_FOUND.code).toBe(404);
      expect(HttpStatus.METHOD_NOT_ALLOWED.code).toBe(405);
    });

    it('5xx 服务端错误', () => {
      expect(HttpStatus.INTERNAL_SERVER_ERROR.code).toBe(500);
      expect(HttpStatus.BAD_GATEWAY.code).toBe(502);
    });
  });

  describe('AllStatus', () => {
    it('AllStatus Map 已填充', () => {
      expect(HttpStatus.AllStatus).toBeInstanceOf(Map);
      expect(HttpStatus.AllStatus.size).toBeGreaterThan(0);
    });

    it('200 状态码可以查到', () => {
      expect(HttpStatus.AllStatus.get(200)).toBe(HttpStatus.OK);
    });

    it('404 状态码可以查到', () => {
      expect(HttpStatus.AllStatus.get(404)).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
