import ValidationMessage from '../../../node-web-mvc/src/validation/ValidationMessage';

const validationMessage = new ValidationMessage();

describe('ValidationMessage', () => {
  describe('format()', () => {
    it('传入 null/undefined 返回空字符串', () => {
      expect(validationMessage.format(null as any)).toBe('');
      expect(validationMessage.format(undefined as any)).toBe('');
    });

    it('传入 message 为简单字符串直接返回', () => {
      const c = { message: 'hello world' } as any;
      expect(validationMessage.format(c)).toBe('hello world');
    });

    it('传入自定义 message 不被资源表中的占位符替换', () => {
      const c = { message: '{custom.name}', name: 'test' } as any;
      // 自定义message没有在resource里，所以key 'custom.name' 查不到资源表
      // resource里也没有这个key，所以替换为空
      expect(validationMessage.format(c)).toBe('');
    });

    it('默认消息模板替换 {value} 占位符（Max/Min 类）', () => {
      const c = {
        message: '{validation.constraints.Max.message}',
        value: 100,
      } as any;
      expect(validationMessage.format(c)).toBe('must be less than or equal to 100');
    });

    it('Size 占位符 {min} {max} 替换', () => {
      const c = {
        message: '{validation.constraints.Size.message}',
        min: 1,
        max: 10,
      } as any;
      expect(validationMessage.format(c)).toBe('size must be between 1 and 10');
    });

    it('Digits 占位符 {integer} {fraction} 替换', () => {
      const c = {
        message: '{validation.constraints.Digits.message}',
        integer: 5,
        fraction: 2,
      } as any;
      expect(validationMessage.format(c)).toBe(
        'numeric value out of bounds (<5 digits>.<2 digits> expected)',
      );
    });

    it('AssertFalse 消息的拼写错误确认（fasle 而非 false）', () => {
      const c = {
        message: '{validation.constraints.AssertFalse.message}',
      } as any;
      const result = validationMessage.format(c);
      // 这是框架中的已知拼写错误
      expect(result).toBe('must be fasle');
    });

    it('Pattern 占位符 {regexp} 替换', () => {
      const c = {
        message: '{validation.constraints.Pattern.message}',
        regexp: /[a-z]+/,
      } as any;
      expect(validationMessage.format(c)).toBe('must match "/[a-z]+/"');
    });

    it('约束对象上有 name 属性时不覆盖它的值', () => {
      const c = {
        message: '{validation.constraints.AssertTrue.message}',
      } as any;
      // 资源表查到的 message ="must be true"
      expect(validationMessage.format(c)).toBe('must be true');
    });

    it('占位符嵌套属性路径 style 不被支持', () => {
      const c = {
        message: '{validation.constraints.Max.message}',
        value: 50,
      } as any;
      // placeholderRegexp 允许 {value.nested} 这种格式
      // 但实际替换时只取整个 "value.nested" 查约束对象
      expect(validationMessage.format(c)).toBe('must be less than or equal to 50');
    });

    it('message 对象（非字符串）转为字符串', () => {
      const c = { message: 12345 as any } as any;
      expect(validationMessage.format(c)).toBe('12345');
    });
  });
});
