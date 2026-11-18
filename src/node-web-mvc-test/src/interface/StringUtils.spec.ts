import StringUtils from '../../../node-web-mvc/src/interface/StringUtils';

describe('StringUtils', () => {
  describe('format', () => {
    it('替换单个占位符', () => {
      const result = StringUtils.format('Hello, {name}', { name: 'World' });
      expect(result).toBe('Hello, World');
    });

    it('替换多个占位符', () => {
      const result = StringUtils.format('{greeting}, {name}!', { greeting: 'Hi', name: 'Alice' });
      expect(result).toBe('Hi, Alice!');
    });

    it('数字索引占位符', () => {
      const result = StringUtils.format('{0}-{1}', { '0': 'foo', '1': 'bar' });
      expect(result).toBe('foo-bar');
    });

    it('data 为空时不替换', () => {
      const result = StringUtils.format('Hello, {name}', null as any);
      expect(result).toBe('Hello, {name}');
    });

    it('template 为空返回空字符串', () => {
      const result = StringUtils.format('', { name: 'World' });
      expect(result).toBe('');
    });

    it('无匹配占位符返回 undefined', () => {
      const result = StringUtils.format('Hello, {user}', { name: 'World' });
      expect(result).toBe('Hello, undefined');
    });
  });

  describe('isEmpty', () => {
    it('null 返回 true', () => {
      expect(StringUtils.isEmpty(null)).toBe(true);
    });

    it('undefined 返回 true', () => {
      expect(StringUtils.isEmpty(undefined)).toBe(true);
    });

    it('空字符串返回 true', () => {
      expect(StringUtils.isEmpty('')).toBe(true);
    });

    it('非空返回 false', () => {
      expect(StringUtils.isEmpty('text')).toBe(false);
    });
  });

  describe('emptyOf', () => {
    it('有值时返回原值', () => {
      expect(StringUtils.emptyOf('value', 'default')).toBe('value');
    });

    it('空值时返回默认值', () => {
      expect(StringUtils.emptyOf(null, 'default')).toBe('default');
      expect(StringUtils.emptyOf('', 'default')).toBe('default');
    });
  });
});
