import {
  toBigInt,
  toString,
  toNumber,
  toBoolean,
  toDate,
} from '../../../node-web-mvc/src/serialization/BasicTypeConverter';
import { ValueConvertError } from 'node-web-mvc';

describe('BasicTypeConverter', () => {
  describe('toBigInt', () => {
    it('数字字符串转 BigInt', () => {
      expect(toBigInt('123')).toBe(BigInt('123'));
    });

    it('非法值抛 ValueConvertError', () => {
      expect(() => toBigInt({})).toThrow(ValueConvertError);
    });
  });

  describe('toString', () => {
    it('基本类型转字符串', () => {
      expect(toString(123)).toBe('123');
      expect(toString(true)).toBe('true');
    });

    it('null/undefined 返回 null', () => {
      expect(toString(null)).toBeNull();
      expect(toString(undefined)).toBeNull();
    });

    it('传入 String 子类构造器则实例化该类型', () => {
      class MyString extends String {}
      const result = toString('hello', MyString);
      expect(result).toBeInstanceOf(MyString);
      expect(result.toString()).toBe('hello');
    });
  });

  describe('toNumber', () => {
    it('数字字符串转 Number', () => {
      expect(toNumber('3.14')).toBe(3.14);
    });

    it('NaN 抛 ValueConvertError', () => {
      expect(() => toNumber(NaN)).toThrow(ValueConvertError);
    });

    it('传入 Number 子类构造器则实例化该类型', () => {
      class MyNumber extends Number {}
      const result = toNumber('42', MyNumber);
      expect(result).toBeInstanceOf(MyNumber);
      expect(Number(result)).toBe(42);
    });
  });

  describe('toBoolean', () => {
    it('boolean 原样返回', () => {
      expect(toBoolean(true)).toBe(true);
      expect(toBoolean(false)).toBe(false);
    });

    it('0 / "false" → false', () => {
      expect(toBoolean(0)).toBe(false);
      expect(toBoolean('false')).toBe(false);
    });

    it('1 / "true" → true', () => {
      expect(toBoolean(1)).toBe(true);
      expect(toBoolean('true')).toBe(true);
    });

    it('非法值抛 ValueConvertError', () => {
      expect(() => toBoolean('yes')).toThrow(ValueConvertError);
    });
  });

  describe('toDate', () => {
    it('ISO 字符串转 Date', () => {
      const d = toDate('2024-01-15T00:00:00Z');
      expect(d).toBeInstanceOf(Date);
      expect(d.toISOString()).toBe('2024-01-15T00:00:00.000Z');
    });

    it('非法字符串抛 ValueConvertError', () => {
      expect(() => toDate('not a date')).toThrow(ValueConvertError);
    });

    it('传入 Date 子类构造器则实例化该类型', () => {
      class MyDate extends Date {}
      const result = toDate('2024-01-15T00:00:00Z', MyDate);
      expect(result).toBeInstanceOf(MyDate);
    });
  });
});
