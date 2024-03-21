

export default class GenericType {
  /**
   * 泛型类名
   */
  public readonly name: string

  public readonly isArray: boolean

  /**
   * 泛型参数列表
   */
  public parameters: string[]

  public childName: string

  /**
   * 判断是否为泛型模板
   * @param type 例如: ?  A<?>  A<0,1> 
   * @returns 
   */
  public static isGeneric(type: string) {
    type = String(type);
    return type.indexOf('?') > -1 || /<\d/.test(type);
  }

  /**
   * 泛型表达式
   * @param express 例如: A<B,C>
   */
  constructor(express: string) {
    const [name, ...segments] = express.split('<');
    const suffix = segments.join('<').replace(/>$/, '');
    this.name = name;
    this.parameters = suffix.split(',').filter(Boolean);
    this.childName = suffix;
    this.isArray = /Array|List/.test(name);
    if (/\[\]/.test(name)) {
      this.childName = this.name.replace('[]', '');
      this.isArray = true;
    }
  }

  fillTo(template: string) {
    template = template.trim();
    if (template === '?') {
      return new GenericType(this.parameters[0]);
    }
    const generic2 = new GenericType(template);
    generic2.parameters = generic2.parameters.map((value) => {
      const idx = value == '?' ? 0 : value;
      return this.parameters[idx];
    });
    return generic2;
  }

  toString() {
    if (this.parameters.length > 0) {
      return `${this.name}<${this.parameters.join(',')}>`
    }
    return this.name;
  }
}