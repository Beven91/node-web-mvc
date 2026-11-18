import { isEmpty, equalsIgnoreCase, isSimpleValueType, getVariableName, emptyOf } from '../../../../node-web-mvc/src/servlets/util/ApiUtils';

describe('ApiUtils', () => {
  describe('isEmpty', () => {
    it('undefined 返回 true', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('null 返回 true', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('空字符串返回 true', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('非空字符串返回 false', () => {
      expect(isEmpty('hello')).toBe(false);
    });

    it('0 返回 false', () => {
      expect(isEmpty(0)).toBe(false);
    });

    it('false 返回 false', () => {
      expect(isEmpty(false)).toBe(false);
    });

    it('空数组返回 false（不检查数组长度）', () => {
      expect(isEmpty([])).toBe(false);
    });
  });

  describe('equalsIgnoreCase', () => {
    it('完全相同返回 true', () => {
      expect(equalsIgnoreCase('abc', 'abc')).toBe(true);
    });

    it('大小写不同返回 true', () => {
      expect(equalsIgnoreCase('AbC', 'aBc')).toBe(true);
    });

    it('不同字符串返回 false', () => {
      expect(equalsIgnoreCase('abc', 'xyz')).toBe(false);
    });

    it('处理非字符串参数', () => {
      expect(equalsIgnoreCase(123 as any, '123')).toBe(true);
    });
  });

  describe('isSimpleValueType', () => {
    it('undefined 是简单类型', () => {
      expect(isSimpleValueType(undefined)).toBe(true);
    });

    it('null 是简单类型', () => {
      expect(isSimpleValueType(null)).toBe(true);
    });

    it('Number 是简单类型', () => {
      expect(isSimpleValueType(Number)).toBe(true);
    });

    it('String 是简单类型', () => {
      expect(isSimpleValueType(String)).toBe(true);
    });

    it('Date 是简单类型', () => {
      expect(isSimpleValueType(Date)).toBe(true);
    });

    it('Boolean 是简单类型', () => {
      expect(isSimpleValueType(Boolean)).toBe(true);
    });

    it('BigInt 是简单类型', () => {
      expect(isSimpleValueType(BigInt)).toBe(true);
    });

    it('自定义类不是简单类型', () => {
      class MyClass {}
      expect(isSimpleValueType(MyClass)).toBe(false);
    });
  });

  describe('getVariableName', () => {
    it('HelloWorld → helloWorld', () => {
      class HelloWorld {}
      expect(getVariableName(HelloWorld)).toBe('helloWorld');
    });

    it('User → user', () => {
      class User {}
      expect(getVariableName(User)).toBe('user');
    });
  });

  describe('emptyOf', () => {
    it('非空值返回原值', () => {
      expect(emptyOf('hello', 'default')).toBe('hello');
    });

    it('空值返回默认值', () => {
      expect(emptyOf(null, 'default')).toBe('default');
      expect(emptyOf(undefined, 'default')).toBe('default');
      expect(emptyOf('', 'default')).toBe('default');
    });
  });
});
