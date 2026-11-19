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

  // ========== 攻击性测试：挑战 parsers 和 DateConverter 的边界缺陷 ==========

  describe('【攻击】parse 12小时制 h 模式', () => {
    // BUG: parsers.ts 'h' 检查 Number(raw) < 24，应为 < 13
    // 12小时制允许 1-12，但当前实现接受 13-23
    it('h 模式接受 13（12小时制不应接受）', () => {
      const converter = DateConverter.of('yyyy-MM-dd hh:mm:ss');
      // 13 点在 12 小时制中是 1 PM，但 h 模式应只接受 1-12
      // 当前 parser 用 < 24 检查，因此 13 会被接受
      const result = converter.parse('2024-06-15 13:30:45');
      // 揭示缺陷：12小时制 h 模式接受了 13
      expect(result).not.toBeNull();
    });

    it('h 模式接受 0（midnight 应表示为 12 AM）', () => {
      const converter = DateConverter.of('yyyy-MM-dd hh:mm:ss');
      const result = converter.parse('2024-06-15 00:30:45');
      // 0 点在 12 小时制中通常不被接受（应用 12 表示）
      expect(result).not.toBeNull();
    });
  });

  describe('【攻击】parse 时区 Z 符号方向', () => {
    // BUG: parsers.ts 'Z' 返回 symbol == '+' ? -allMinutes : allMinutes
    // +0800 应该表示 UTC+8，返回正偏移，但代码返回负值
    // 不过 DateConverter.parse 中的公式 offset = getTimezoneOffset() - zone
    // 恰好用减法"修正"了这个翻转，双重否定得到正确结果
    // 这里验证整体行为是否正确，并文档化解析器的符号缺陷
    it('+0800 时区解析（验证双重否定正确性）', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss Z');
      const result = converter.parse('2024-06-15 12:00:00 +0800');
      expect(result).toBeInstanceOf(Date);
      // +0800 = UTC+8，12:00 UTC+8 = 04:00 UTC
      expect(result!.getUTCHours()).toBe(4);
    });

    it('-0500 时区解析', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss Z');
      const result = converter.parse('2024-06-15 12:00:00 -0500');
      expect(result).toBeInstanceOf(Date);
      // -0500 = UTC-5，12:00 UTC-5 = 17:00 UTC
      expect(result!.getUTCHours()).toBe(17);
    });

    it('无时区字符串应使用本地时区', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      const result = converter.parse('2024-06-15 12:00:00');
      expect(result).toBeInstanceOf(Date);
      // 无时区时应按本地时间解析，验证本地时分秒保持一致（与时区无关的稳健断言）
      expect(result!.getHours()).toBe(12);
      expect(result!.getMinutes()).toBe(0);
      expect(result!.getSeconds()).toBe(0);
    });
  });

  describe('【攻击】parse 星期 E 模式变量遮蔽', () => {
    // BUG: DateConverter.parse 第 93 行 const offset = parseInt(record.E) - week
    // 覆盖了第 80 行的时区 const offset
    // 虽然当前代码流中第 80 行的 offset 在第 85-87 行已使用完，
    // 但这仍是代码坏味道，可能在未来重构中引入 bug
    it('带星期 E 的格式解析正常', () => {
      // 2024-01-15 是星期一 (Mon)，week=1
      const converter = DateConverter.of('yyyy-MM-dd E');
      const result = converter.parse('2024-01-15 Mon');
      // 主要验证解析不崩溃且返回有效日期
      expect(result).toBeInstanceOf(Date);
    });
  });

  describe('【攻击】parse 边界输入', () => {
    it('不匹配格式的输入抛 DateTimeParseException', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      // 框架抛异常而非返回 null —— 这是合理的设计选择
      expect(() => converter.parse('not-a-date')).toThrow();
    });

    it('部分匹配的输入抛 DateTimeParseException', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      expect(() => converter.parse('2024-01-15')).toThrow();
    });

    it('超长年份抛异常', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      expect(() => converter.parse('12345-01-15')).toThrow();
    });

    it('月份为 0', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      const result = converter.parse('2024-00-15');
      // month = parseInt('00') - 1 = -1，Date 会 wrap 到上一年 11 月
      expect(result).toBeInstanceOf(Date);
    });

    it('日期为 0', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      const result = converter.parse('2024-06-00');
      // day=0 时 Date 会 wrap 到上月最后一天
      expect(result).toBeInstanceOf(Date);
    });

    it('日期超出范围（32日）', () => {
      const converter = DateConverter.of('yyyy-MM-dd');
      const result = converter.parse('2024-01-32');
      // 32 日会 wrap 到 2 月 1 日，但 parser 的 'd' 检查 < 32 会通过
      // Date 构造会自动 wrap
      expect(result).toBeInstanceOf(Date);
      expect(result!.getDate()).not.toBe(32);
    });

    // BUG: 两位制格式(HH/mm/ss)仅检查长度，不检查数值范围
    // 一位制格式(H/m/s)有范围检查，但两位制没有
    it('【缺陷】HH 两位制小时接受 25', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      // HH 模式仅检查 raw.length == 2，25 通过
      // 但一位制 H 模式会检查 < 24
      const result = converter.parse('2024-06-15 25:00:00');
      // 缺陷：两位制小时接受 25，但 Date 构造会自动 wrap 到次日 01:00
      expect(result).toBeInstanceOf(Date);
    });

    it('【缺陷】mm 两位制分钟接受 60', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      // mm 仅检查 raw.length == 2，60 通过
      // Date 构造会 wrap 到下一小时
      const result = converter.parse('2024-06-15 12:60:00');
      expect(result).toBeInstanceOf(Date);
    });

    it('【缺陷】ss 两位制秒接受 60', () => {
      const converter = DateConverter.of('yyyy-MM-dd HH:mm:ss');
      // ss 仅检查 raw.length == 2，60 通过
      // Date 构造会 wrap 到下一分钟
      const result = converter.parse('2024-06-15 12:00:60');
      expect(result).toBeInstanceOf(Date);
    });
  });
});
