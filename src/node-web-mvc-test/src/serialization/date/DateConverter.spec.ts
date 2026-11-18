import DateConverter from '../../../../node-web-mvc/src/serialization/date/DateConverter';
import Locale from '../../../../node-web-mvc/src/locale/Locale';

describe('DateConverter', () => {
  describe('parse', () => {
    it('yyyy-MM-dd', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      const result = converter.parse('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getFullYear()).toBe(2024);
      expect(result!.getMonth()).toBe(0);
      expect(result!.getDate()).toBe(15);
    });

    it('yyyy-MM-dd HH:mm:ss', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      const result = converter.parse('2024-06-15 14:30:45');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getHours()).toBe(14);
      expect(result!.getMinutes()).toBe(30);
      expect(result!.getSeconds()).toBe(45);
    });

    it('空字符串返回 null', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      expect(converter.parse('')).toBeNull();
    });

    it('null 返回 null', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      expect(converter.parse(null as any)).toBeNull();
    });

    it('yyyy/MM/dd 非标准分隔符', () => {
      const converter = DateConverter.of('yyyy\'/\'MM\'/\'dd');
      const result = converter.parse('2024/03/20');
      expect(result).toBeInstanceOf(Date);
      expect(result!.getMonth()).toBe(2);
    });
  });

  describe('format', () => {
    it('yyyy-MM-dd', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      const date = new Date(2024, 0, 15);
      expect(converter.format(date)).toBe('2024-01-15');
    });

    it('yyyy-MM-dd HH:mm:ss', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      const date = new Date(2024, 5, 15, 14, 30, 45);
      expect(converter.format(date)).toBe('2024-06-15 14:30:45');
    });

    it('yy 简写年', () => {
      const converter = DateConverter.of('yy-MM-dd');
      const date = new Date(2024, 0, 15);
      expect(converter.format(date)).toBe('24-01-15');
    });

    it('hh 12小时制', () => {
      const converter = DateConverter.of('hh:mm');
      const date = new Date(2024, 0, 1, 14, 30);
      const result = converter.format(date);
      expect(result).toBe('02:30');
    });

    it('H 24小时制', () => {
      const converter = DateConverter.of('H:mm');
      const date = new Date(2024, 0, 1, 14, 30);
      expect(converter.format(date)).toBe('14:30');
    });
  });

  describe('static of', () => {
    it('返回 DateConverter 实例', () => {
      const converter = DateConverter.of('yyyy-MM-dd', Locale.ENGLISH);
      expect(converter).toBeInstanceOf(DateConverter);
    });
  });
});
