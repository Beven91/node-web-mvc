import ValueConvertError from '../../../node-web-mvc/src/errors/ValueConvertError';

describe('ValueConvertError', () => {
  it('包含值和目标类型信息', () => {
    const err = new ValueConvertError('abc', Number);
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toContain('abc');
    expect(err.message).toContain('Number');
  });

  it('不同类型的转换错误消息', () => {
    const err = new ValueConvertError({}, Date);
    expect(err.message).toContain('Date');
  });
});
