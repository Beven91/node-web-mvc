import { Normalizer } from 'node-web-mvc';
import Exception from '../../../node-web-mvc/src/errors/Exception';

describe('Normalizer', () => {
  describe('normalizeError', () => {
    it('Error 实例原样返回', () => {
      const err = new Error('boom');
      expect(Normalizer.normalizeError(err)).toBe(err);
    });

    it('string 转为 Error', () => {
      const err = Normalizer.normalizeError('something wrong');
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('something wrong');
    });

    it('普通对象原样返回', () => {
      const raw = { message: 'obj error', code: 500 };
      expect(Normalizer.normalizeError(raw)).toBe(raw);
    });

    it('null/undefined 等非对象转为 Exception', () => {
      const err = Normalizer.normalizeError(null) as Exception;
      expect(err).toBeInstanceOf(Exception);
      expect(err.data).toBeUndefined();
    });

    it('number 转为 Exception 并携带原始数据', () => {
      const err = Normalizer.normalizeError(42) as Exception;
      expect(err).toBeInstanceOf(Exception);
      expect(err.data).toBe(42);
    });
  });
});

describe('Exception', () => {
  it('message 正确设置', () => {
    const ex = new Exception('custom error');
    expect(ex.message).toBe('custom error');
  });

  it('name 为构造器名', () => {
    const ex = new Exception('custom error');
    expect(ex.name).toBe('Exception');
  });

  it('data 为 falsy 时不设置', () => {
    const ex = new Exception('msg', undefined);
    expect(ex.data).toBeUndefined();
  });

  it('data 有值时正确设置', () => {
    const payload = { a: 1 };
    const ex = new Exception('msg', payload);
    expect(ex.data).toBe(payload);
  });
});
