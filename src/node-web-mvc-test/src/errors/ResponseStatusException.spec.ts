import ResponseStatusException from '../../../node-web-mvc/src/errors/ResponseStatusException';

describe('ResponseStatusException', () => {
  it('正确设置 code 和 reason', () => {
    const err = new ResponseStatusException(400, 'Bad Request');
    expect(err.code).toBe(400);
    expect(err.reason).toBe('Bad Request');
    expect(err.message).toContain('400');
    expect(err).toBeInstanceOf(Error);
  });

  it('getResponseHeaders 返回空对象', () => {
    const err = new ResponseStatusException(500, 'Internal Error');
    expect(err.getResponseHeaders()).toEqual({});
  });
});
