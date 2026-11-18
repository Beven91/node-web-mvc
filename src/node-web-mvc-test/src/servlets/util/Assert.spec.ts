import Assert from '../../../../node-web-mvc/src/servlets/util/Assert';
import Exception from '../../../../node-web-mvc/src/errors/Exception';

describe('Assert', () => {
  describe('notNull', () => {
    it('非 null/undefined 不抛异常', () => {
      expect(() => Assert.notNull('hello')).not.toThrow();
      expect(() => Assert.notNull(0)).not.toThrow();
      expect(() => Assert.notNull(false)).not.toThrow();
      expect(() => Assert.notNull({})).not.toThrow();
    });

    it('null 抛异常', () => {
      expect(() => Assert.notNull(null)).toThrow('[Assertion failed]');
    });

    it('undefined 抛异常', () => {
      expect(() => Assert.notNull(undefined)).toThrow('[Assertion failed]');
    });

    it('抛出自定义 message', () => {
      expect(() => Assert.notNull(null, 'name is required')).toThrow('name is required');
    });
  });

  describe('isNull', () => {
    it('null 不抛异常', () => {
      expect(() => Assert.isNull(null)).not.toThrow();
    });

    it('undefined 不抛异常', () => {
      expect(() => Assert.isNull(undefined)).not.toThrow();
    });

    it('非空值抛异常', () => {
      expect(() => Assert.isNull('hello')).toThrow('[Assertion failed]');
      expect(() => Assert.isNull(0)).toThrow('[Assertion failed]');
    });

    it('抛出自定义 message', () => {
      expect(() => Assert.isNull('value', 'must be null')).toThrow('must be null');
    });
  });

  describe('isEmpty', () => {
    it('null 不抛异常', () => {
      expect(() => Assert.isEmpty(null)).not.toThrow();
    });

    it('undefined 不抛异常', () => {
      expect(() => Assert.isEmpty(undefined)).not.toThrow();
    });

    it('空字符串不抛异常', () => {
      expect(() => Assert.isEmpty('')).not.toThrow();
    });

    it('空数组不抛异常', () => {
      expect(() => Assert.isEmpty([])).not.toThrow();
    });

    it('非空值抛异常', () => {
      expect(() => Assert.isEmpty('hello')).toThrow('[Assertion failed]');
      expect(() => Assert.isEmpty([ 1, 2 ])).toThrow('[Assertion failed]');
    });
  });

  describe('notEmpty', () => {
    it('非空字符串不抛异常', () => {
      expect(() => Assert.notEmpty('hello')).not.toThrow();
    });

    it('非空数组不抛异常', () => {
      expect(() => Assert.notEmpty([ 1 ])).not.toThrow();
    });

    it('null 抛异常', () => {
      expect(() => Assert.notEmpty(null)).toThrow('[Assertion failed]');
    });

    it('undefined 抛异常', () => {
      expect(() => Assert.notEmpty(undefined)).toThrow('[Assertion failed]');
    });

    it('空字符串抛异常', () => {
      expect(() => Assert.notEmpty('')).toThrow('[Assertion failed]');
    });

    it('空数组抛异常', () => {
      expect(() => Assert.notEmpty([])).toThrow('[Assertion failed]');
    });
  });

  describe('doesContain', () => {
    it('包含子串不抛异常', () => {
      expect(() => Assert.doesContain('hello world', 'world')).not.toThrow();
    });

    it('包含子串抛异常', () => {
      expect(() => Assert.doesContain('hello world', 'xyz')).toThrow('[Assertion failed]');
    });

    it('null/undefined 转为空字符串处理', () => {
      expect(() => Assert.doesContain(null as any, 'x')).toThrow('[Assertion failed]');
    });
  });

  describe('doesNotContain', () => {
    it('不包含不抛异常', () => {
      expect(() => Assert.doesNotContain('hello world', 'xyz')).not.toThrow();
    });

    it('包含抛异常', () => {
      expect(() => Assert.doesNotContain('hello world', 'hello')).toThrow('[Assertion failed]');
    });

    it('null/undefined 转为空字符串处理', () => {
      expect(() => Assert.doesNotContain(null as any, 'x')).not.toThrow();
    });
  });

  describe('noNullElements', () => {
    it('无 null/undefined 不抛异常', () => {
      expect(() => Assert.noNullElements([ 'a', 'b', 1 ])).not.toThrow();
    });

    it('空数组不抛异常', () => {
      expect(() => Assert.noNullElements([])).not.toThrow();
    });

    it('含 null 抛异常', () => {
      expect(() => Assert.noNullElements([ 'a', null, 'c' ])).toThrow('[Assertion failed]');
    });

    it('含 undefined 抛异常', () => {
      expect(() => Assert.noNullElements([ 'a', undefined, 'c' ])).toThrow('[Assertion failed]');
    });

    it('null/undefined 数组被当做空数组处理', () => {
      expect(() => Assert.noNullElements(null as any)).not.toThrow();
    });
  });

  describe('isInstanceOf', () => {
    it('instanceof 通过不抛异常', () => {
      expect(() => Assert.isInstanceOf(new Date(), Date)).not.toThrow();
    });

    it('非 instanceof 抛异常', () => {
      expect(() => Assert.isInstanceOf({}, Date)).toThrow('[Assertion failed]');
    });

    it('抛出自定义 message', () => {
      expect(() => Assert.isInstanceOf('str', Number, 'must be number')).toThrow('must be number');
    });
  });

  describe('isType', () => {
    it('同类型不抛异常', () => {
      expect(() => Assert.isType('hello', String)).not.toThrow();
      expect(() => Assert.isType(123, Number)).not.toThrow();
    });

    it('不同类型抛异常', () => {
      expect(() => Assert.isType(123, String)).toThrow('[Assertion failed]');
    });
  });
});
