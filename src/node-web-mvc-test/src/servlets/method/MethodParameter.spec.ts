import MethodParameter from '../../../../node-web-mvc/src/servlets/method/MethodParameter';
import MultipartFile from '../../../../node-web-mvc/src/servlets/http/MultipartFile';
import type { MetaRuntimeTypeInfo } from '../../../../node-web-mvc/src/servlets/annotations/annotation/type';

class User {}
class Admin extends User {}
class Other {}

function runtimeType(clazz: Function, args?: Array<{ clazz: Function }>, extra?: Partial<MetaRuntimeTypeInfo>): MetaRuntimeTypeInfo {
  return {
    clazz,
    name: clazz.name,
    array: false,
    enum: false,
    fullName: '',
    args,
    ...extra,
  } as unknown as MetaRuntimeTypeInfo;
}

describe('MethodParameter', () => {
  describe('构造', () => {
    it('解析基础字段', () => {
      const rt = runtimeType(User);
      const p = new MethodParameter(User, 'index', 'id', 1, rt);
      expect(p.beanType).toBe(User);
      expect(p.method).toBe('index');
      expect(p.paramName).toBe('id');
      expect(p.paramIndex).toBe(1);
      expect(p.parameterType).toBe(User);
      expect(p.runtimeType).toBe(rt);
    });
  });

  describe('isParamAssignableOf', () => {
    it('父类型为 null 返回 false', () => {
      const p = new MethodParameter(User, 'index', 'id', 0, runtimeType(User));
      expect(p.isParamAssignableOf(null as any)).toBe(false);
    });

    it('类型一致返回 true', () => {
      const p = new MethodParameter(User, 'index', 'id', 0, runtimeType(User));
      expect(p.isParamAssignableOf(User)).toBe(true);
    });

    it('子类型可赋值给父类型', () => {
      const p = new MethodParameter(Admin, 'index', 'id', 0, runtimeType(Admin));
      expect(p.isParamAssignableOf(User)).toBe(true);
    });

    it('非继承类型返回 false', () => {
      const p = new MethodParameter(Other, 'index', 'id', 0, runtimeType(Other));
      expect(p.isParamAssignableOf(User)).toBe(false);
    });
  });

  describe('泛型参数', () => {
    it('getParameterGenericTypeOf 获取泛型类型', () => {
      const p = new MethodParameter(
        User,
        'index',
        'id',
        0,
        runtimeType(Array, [ { clazz: User } ]),
      );
      expect(p.getParameterGenericTypeOf(0)).toBe(User);
    });

    it('无泛型返回 undefined', () => {
      const p = new MethodParameter(User, 'index', 'id', 0, runtimeType(User));
      expect(p.getParameterGenericTypeOf(0)).toBeUndefined();
    });

    it('isExtParamAssignableOf', () => {
      const p = new MethodParameter(
        User,
        'index',
        'id',
        0,
        runtimeType(Array, [ { clazz: Admin } ]),
      );
      expect(p.isExtParamAssignableOf(0, User)).toBe(true);
      expect(p.isExtParamAssignableOf(0, Other)).toBe(false);
    });
  });

  describe('isMultipartAccept', () => {
    it('参数类型直接为 MultipartFile', () => {
      const p = new MethodParameter(User, 'index', 'file', 0, runtimeType(MultipartFile));
      expect(p.isMultipartAccept()).toBe(true);
    });

    it('数组泛型为 MultipartFile', () => {
      const p = new MethodParameter(
        User,
        'index',
        'files',
        0,
        runtimeType(Array, [ { clazz: MultipartFile } ], { array: true }),
      );
      expect(p.isMultipartAccept()).toBe(true);
    });

    it('非 multipart 返回 false', () => {
      const p = new MethodParameter(User, 'index', 'id', 0, runtimeType(User));
      expect(p.isMultipartAccept()).toBe(false);
    });
  });
});
