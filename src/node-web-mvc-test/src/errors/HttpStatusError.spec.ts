import HttpStatusError from '../../../node-web-mvc/src/errors/HttpStatusError';
import HttpStatus from '../../../node-web-mvc/src/servlets/http/HttpStatus';

describe('HttpStatusError', () => {
  it('正确设置 status 和 path', () => {
    const err = new HttpStatusError(HttpStatus.NOT_FOUND, '/api/user');
    expect(err.status).toBe(HttpStatus.NOT_FOUND);
    expect(err.path).toBe('/api/user');
    expect(err.message).toContain('404');
    expect(err.message).toContain('/api/user');
    expect(err).toBeInstanceOf(Error);
  });

  it('不同状态码', () => {
    const err = new HttpStatusError(HttpStatus.INTERNAL_SERVER_ERROR, '/api/data');
    expect(err.status.code).toBe(500);
    expect(err.path).toBe('/api/data');
  });
});
