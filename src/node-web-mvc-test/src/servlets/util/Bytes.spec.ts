import Bytes from '../../../../node-web-mvc/src/servlets/util/Bytes';

describe('Bytes', () => {
  describe('构造 - 字符串输入', () => {
    it('"1mb" 解析为 1048576', () => {
      expect(new Bytes('1mb', '0').bytes).toBe(1048576);
    });

    it('"1kb" 解析为 1024', () => {
      expect(new Bytes('1kb', '0').bytes).toBe(1024);
    });

    it('"1gb" 解析为 1073741824', () => {
      expect(new Bytes('1gb', '0').bytes).toBe(1073741824);
    });

    it('"1tb" 解析正确', () => {
      expect(new Bytes('1tb', '0').bytes).toBe(Math.pow(1024, 4));
    });

    it('"1pb" 解析正确', () => {
      expect(new Bytes('1pb', '0').bytes).toBe(Math.pow(1024, 5));
    });

    it('"0.5mb" 解析', () => {
      expect(new Bytes('0.5mb', '0').bytes).toBe(524288);
    });

    it('负数忽略', () => {
      expect(new Bytes('-1mb', '0').bytes).toBe(0);
    });

    it('无效格式返回 0', () => {
      expect(new Bytes('abc', '0').bytes).toBe(0);
    });

    it('大小写不敏感', () => {
      expect(new Bytes('1MB', '0').bytes).toBe(1048576);
      expect(new Bytes('1Kb', '0').bytes).toBe(1024);
    });

    it('空字符串使用默认值', () => {
      expect(new Bytes('', '1mb').bytes).toBe(1048576);
    });

    it('null 使用默认值', () => {
      expect(new Bytes(null as any, '1kb').bytes).toBe(1024);
    });

    it('undefined 使用默认值', () => {
      expect(new Bytes(undefined as any, '1mb').bytes).toBe(1048576);
    });
  });

  describe('构造 - 数字输入', () => {
    it('数字直接赋值', () => {
      expect(new Bytes(2048, '0').bytes).toBe(2048);
    });

    it('0 有效', () => {
      expect(new Bytes(0, '0').bytes).toBe(0);
    });
  });

  describe('带空格', () => {
    it('数字与单位间有空格可以解析', () => {
      expect(new Bytes('10  mb', '0').bytes).toBe(10 * 1048576);
    });
  });
});
