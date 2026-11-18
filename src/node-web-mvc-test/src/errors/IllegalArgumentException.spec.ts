import IllegalArgumentException from '../../../node-web-mvc/src/errors/IllegalArgumentException';

describe('IllegalArgumentException', () => {
  it('是 Exception 的子类', () => {
    const err = new IllegalArgumentException('illegal argument');
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('illegal argument');
    expect(err.name).toBe('IllegalArgumentException');
  });

  it('可以不带参数构造', () => {
    const err = new IllegalArgumentException();
    expect(err).toBeInstanceOf(Error);
  });
});