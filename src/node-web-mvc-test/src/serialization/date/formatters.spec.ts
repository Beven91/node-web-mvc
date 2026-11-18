import { padZero, checkLimit } from '../../../../node-web-mvc/src/serialization/date/formatters';

describe('formatters', () => {
  describe('padZero', () => {
    it('位数不足补零', () => {
      expect(padZero(5, 3)).toBe('005');
    });

    it('位数相等不变', () => {
      expect(padZero(123, 3)).toBe('123');
    });

    it('位数超出不截断', () => {
      expect(padZero(12345, 3)).toBe('12345');
    });

    it('0 补零', () => {
      expect(padZero(0, 2)).toBe('00');
    });
  });

  describe('checkLimit', () => {
    it('长度在限制内不抛异常', () => {
      expect(() => checkLimit('yyy', 4)).not.toThrow();
    });

    it('等于限制不抛异常', () => {
      expect(() => checkLimit('yyyy', 4)).not.toThrow();
    });

    it('超过限制抛异常', () => {
      expect(() => checkLimit('yyyyy', 4)).toThrow('Too many pattern letters');
    });
  });
});
