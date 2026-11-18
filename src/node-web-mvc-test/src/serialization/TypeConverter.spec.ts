import TypeConverter from '../../../node-web-mvc/src/serialization/TypeConverter';
import ValueConvertError from '../../../node-web-mvc/src/errors/ValueConvertError';
import { MetaRuntimeTypeInfo } from '../../../node-web-mvc/src/servlets/annotations/annotation/type';

const meta = (clazz: Function, args?: Function[], extra: Record<string, any> = {}): MetaRuntimeTypeInfo => ({
  clazz,
  name: clazz.name,
  array: false,
  fullName: clazz.name,
  args: args?.map((c) => ({ clazz: c, name: c.name, array: false, fullName: c.name })),
  ...extra,
} as unknown as MetaRuntimeTypeInfo);

describe('TypeConverter', () => {
  let converter: TypeConverter;

  beforeEach(() => {
    converter = new TypeConverter();
  });

  describe('convert 基础类型', () => {
    it('null/undefined 返回 null', () => {
      expect(converter.convert(null as any, String)).toBeNull();
      expect(converter.convert(undefined as any, Number)).toBeNull();
    });

    it('无类型时原样返回', () => {
      const obj = { a: 1 };
      expect(converter.convert(obj, undefined as any)).toBe(obj);
    });

    it('BigInt 类型', () => {
      expect(converter.convert('123' as any, BigInt as any)).toBe(BigInt('123'));
    });

    it('String 类型', () => {
      expect(converter.convert(123 as any, String)).toBe('123');
    });

    it('Number 类型', () => {
      expect(converter.convert('42' as any, Number)).toBe(42);
    });

    it('Boolean 类型', () => {
      expect(converter.convert('true' as any, Boolean)).toBe(true);
    });

    it('Date 类型', () => {
      const d = converter.convert('2024-01-15T00:00:00Z' as any, Date);
      expect(d).toBeInstanceOf(Date);
    });

    it('已经是目标类型实例时，Date 会经过 toDate 转换（非原样返回）', () => {
      const d = new Date('2024-01-15T00:00:00Z');
      const result = converter.convert(d, Date);
      expect(result).toBeInstanceOf(Date);
      // convert 中 isType(Date) 先于 isInstanceof 判断，会走 toDate 路径
      expect(result).not.toBe(d);
    });
  });

  describe('convert 集合类型', () => {
    it('Array 类型', () => {
      const result = converter.convert([1, 2, 3] as any, Array);
      expect(result).toEqual([1, 2, 3]);
    });

    it('非数组值转 Array 包装', () => {
      const result = converter.convert(1 as any, Array);
      expect(result).toEqual([1]);
    });

    it('Set 类型', () => {
      const result = converter.convert([1, 2, 2] as any, Set);
      expect(result).toBeInstanceOf(Set);
      expect([...result]).toEqual([1, 2]);
    });

    it('Map 类型', () => {
      const result = converter.convert({ a: 1, b: 2 } as any, Map);
      expect(result).toBeInstanceOf(Map);
      expect(result.get('a')).toBe(1);
      expect(result.get('b')).toBe(2);
    });

    it('TypedArray 类型', () => {
      const result = converter.convert([1, 2, 3] as any, Uint8Array);
      expect(result).toBeInstanceOf(Uint8Array);
      expect([...result]).toEqual([1, 2, 3]);
    });
  });

  describe('toEnum', () => {
    it('值在枚举中则返回', () => {
      enum Color { RED = 'RED', BLUE = 'BLUE' }
      expect(converter.toEnum('RED', Color)).toBe('RED');
    });

    it('值不在枚举中抛异常', () => {
      enum Color { RED = 'RED' }
      expect(() => converter.toEnum('GREEN', Color)).toThrow('GREEN is not enum value');
    });
  });

  describe('toSet', () => {
    it('数组转 Set', () => {
      const result = converter.toSet([1, 2], Set);
      expect([...result]).toEqual([1, 2]);
    });

    it('单值包装为 Set', () => {
      const result = converter.toSet(5 as any, Set);
      expect([...result]).toEqual([5]);
    });

    it('带 itemType 转换元素', () => {
      const result = converter.toSet(['1', '2'] as any, Set, meta(Set, [Number]));
      expect([...result]).toEqual([1, 2]);
    });
  });

  describe('toMap', () => {
    it('对象转 Map', () => {
      const result = converter.toMap({ a: 1 }, Map);
      expect(result.get('a')).toBe(1);
    });

    it('数组抛 ValueConvertError', () => {
      expect(() => converter.toMap([1], Map)).toThrow(ValueConvertError);
    });

    it('原始类型抛 ValueConvertError', () => {
      expect(() => converter.toMap('x', Map)).toThrow(ValueConvertError);
    });

    it('带 itemType 转换值', () => {
      const result = converter.toMap({ a: '1' } as any, Map, meta(Map, [String, Number]));
      expect(result.get('a')).toBe(1);
    });
  });

  describe('toArray', () => {
    it('数组转数组', () => {
      expect(converter.toArray([1, 2], Array)).toEqual([1, 2]);
    });

    it('单值包装', () => {
      expect(converter.toArray(9 as any, Array)).toEqual([9]);
    });

    it('带 itemType 转换元素', () => {
      const result = converter.toArray(['1'] as any, Array, meta(Array, [Number]));
      expect(result).toEqual([1]);
    });
  });

  describe('toTypedArray', () => {
    it('构造 TypedArray', () => {
      const result = converter.toTypedArray([1, 2, 3], Uint8Array);
      expect([...result]).toEqual([1, 2, 3]);
    });
  });

  describe('toClass', () => {
    it('Object 类型且非对象数据则返回自身', () => {
      expect(converter.toClass(1 as any, Object)).toBe(1);
      expect(converter.toClass(null as any, Object)).toBeNull();
    });

    it('非对象数据抛 ConvertTypeError', () => {
      expect(() => converter.toClass(1 as any, Date)).toThrow();
    });

    it('将普通对象转换为类实例', () => {
      class User { name!: string; age!: number; }
      const result = converter.toClass({ name: 'tom', age: 18 } as any, User);
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe('tom');
      expect(result.age).toBe(18);
    });
  });
});
