/**
 * @module BytesConverter
 * @description 字节单位转换
 */
const unitValues = {
  b: 1,
  kb: 1024,
  mb: Math.pow(1024, 2),
  gb: Math.pow(1024, 3),
  tb: Math.pow(1024, 4),
  pb: Math.pow(1024, 5),
};

export default class Bytes {
  // 根据input计算出来的bytes
  public readonly bytes: number;

  constructor(input: string | number, defaultValue: string) {
    input = (input === '' || input === null || input === undefined) ? defaultValue : input;
    if (typeof input == 'number') {
      this.bytes = input;
    } else if (typeof input === 'string') {
      this.bytes = this.parse(input);
    }
  }

  private parse(input: string) {
    const values = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i.exec(input) || [];
    const unit = (values[4] || '').toLowerCase();
    const value = parseFloat(values[1]);
    if (value > 0) {
      return unitValues[unit] * value;
    }
    return 0;
  }
}
