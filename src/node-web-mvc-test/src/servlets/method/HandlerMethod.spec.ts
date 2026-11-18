import HandlerMethod from '../../../../node-web-mvc/src/servlets/method/HandlerMethod';
import MethodParameter from '../../../../node-web-mvc/src/servlets/method/MethodParameter';
import { BeanFactory } from '../../../../node-web-mvc/src/ioc/factory/BeanFactory';

class TestController {
  index() {
    // no-op
  }

  noArg() {
    return null;
  }

  withArgs(a: string, b: number) {
    // no-op — 仅用于 HandlerMethod(bean, handler) 重载的复制路径
  }
}

/**
 * 构造一个可用的 HandlerMethod（带参数的方法仅能在已有注解或通过派生构造时使用）。
 * 直接 new HandlerMethod(Class, method, factory) 对带参方法会崩溃，因为无注解时
 * dataType 为 undefined 导致 MethodParameter 构造报错。
 * 此处用无参方法避免该问题。
 */
function createHandlerMethod(ctrl?: any, beanFactory?: BeanFactory): HandlerMethod {
  const controller = ctrl || new TestController();
  return new HandlerMethod(controller, controller.noArg);
}

function createMockFactory(bean?: any): BeanFactory {
  return {
    getBean: jest.fn().mockReturnValue(bean ?? new TestController()),
  } as unknown as BeanFactory;
}

describe('HandlerMethod', () => {
  describe('构造 — (bean, method) 重载 (isBeanType=false)', () => {
    it('bean 为实例对象时基本属性正确', () => {
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, ctrl.index);
      expect(hm.bean).toBe(ctrl);
      expect(hm.beanType).toBe(TestController);
      expect(hm.beanTypeName).toBe('TestController');
      expect(hm.method).toBe(ctrl.index);
      expect(hm.methodName).toBe('index');
      expect(hm.parameters).toEqual([]);
    });

    it('bean 不为 null 且不是函数/字符串', () => {
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, ctrl.index);
      expect(hm.bean).not.toBeNull();
      expect(hm.beanFactory).toBeUndefined();
    });
  });

  describe('构造 — (beanType, method, beanFactory) 重载 (isBeanType=true)', () => {
    it('传入类构造器时 isBeanType 为 true', () => {
      const factory = createMockFactory();
      const hm = new HandlerMethod(TestController, TestController.prototype.noArg, factory);
      expect(hm.method).toBe(TestController.prototype.noArg);
      expect(hm.methodName).toBe('noArg');
      expect(hm.bean).toBeNull();
      expect(hm.beanType).toBe(TestController);
      expect(hm.beanTypeName).toBe('TestController');
      expect(hm.beanFactory).toBe(factory);
    });

    it('无参方法参数列表为空', () => {
      const factory = createMockFactory();
      const hm = new HandlerMethod(TestController, TestController.prototype.index, factory);
      expect(hm.parameters).toHaveLength(0);
    });
  });

  describe('构造 — (bean, HandlerMethod) 重载（派生路径）', () => {
    it('从已有 HandlerMethod 复制属性', () => {
      const factory = createMockFactory();
      const original = new HandlerMethod(TestController, TestController.prototype.noArg, factory);
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, original);

      expect(hm.bean).toBe(ctrl);
      expect(hm.beanType).toBe(TestController);
      expect(hm.method).toBe(TestController.prototype.noArg);
      expect(hm.methodName).toBe('noArg');
      expect(hm.beanFactory).toBe(factory);
      expect(hm.resolvedFromHandlerMethod).toBe(original);
    });

    it('派生路径继承参数列表', () => {
      const factory = createMockFactory();
      const original = new HandlerMethod(TestController, TestController.prototype.noArg, factory);
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, original);
      expect(hm.parameters).toBe(original.parameters);
    });

    it('派生路径继承 responseStatus/reason', () => {
      const factory = createMockFactory();
      const original = new HandlerMethod(TestController, TestController.prototype.noArg, factory);
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, original);
      // 因为无 @ResponseStatus 注解，所以保持默认状态
      expect(hm.responseStatus).toBeUndefined();
      expect(hm.responseStatusReason).toBeUndefined();
    });
  });

  describe('beanTypeName', () => {
    it('beanType 存在时返回类名', () => {
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, ctrl.index);
      expect(hm.beanTypeName).toBe('TestController');
    });
  });

  describe('createWithResolvedBean', () => {
    it('isBeanType=false 时返回新 HandlerMethod（bean 转发）', () => {
      const ctrl = new TestController();
      const hm = new HandlerMethod(ctrl, ctrl.noArg);
      const resolved = hm.createWithResolvedBean();
      expect(resolved).toBeInstanceOf(HandlerMethod);
      expect(resolved.bean).toBe(ctrl);
      expect(resolved.method).toBe(ctrl.noArg);
    });

    it('isBeanType=true 时从 factory 取 bean 再派生', () => {
      const ctrl = new TestController();
      const factory = createMockFactory(ctrl);
      const hm = new HandlerMethod(TestController, TestController.prototype.noArg, factory);
      const resolved = hm.createWithResolvedBean();
      expect(factory.getBean).toHaveBeenCalledWith(TestController);
      expect(resolved.bean).toBe(ctrl);
      expect(resolved.method).toBe(TestController.prototype.noArg);
    });
  });

  describe('argumentValues', () => {
    it('默认为 undefined', () => {
      const hm = createHandlerMethod();
      expect(hm.argumentValues).toBeUndefined();
    });

    it('可手动赋值', () => {
      const hm = createHandlerMethod();
      hm.argumentValues = [1, 'hello'];
      expect(hm.argumentValues).toEqual([1, 'hello']);
    });
  });

  describe('getAnnotation / getMethodAnnotation / getClassAnnotation', () => {
    let hm: HandlerMethod;

    beforeEach(() => {
      hm = createHandlerMethod();
    });

    it('无注册注解时 getMethodAnnotation 返回 undefined', () => {
      expect(hm.getMethodAnnotation({} as any)).toBeUndefined();
    });

    it('getAnnotation 委托给 getMethodAnnotation', () => {
      expect(hm.getAnnotation({} as any)).toBeUndefined();
    });

    it('无注册注解时 getClassAnnotation 返回 undefined', () => {
      expect(hm.getClassAnnotation({} as any)).toBeUndefined();
    });

    it('hasMethodAnnotation 无注解时返回 false', () => {
      expect(hm.hasMethodAnnotation({} as any)).toBe(false);
    });
  });

  describe('evaluateResponseStatus（通过派生路径覆盖验证）', () => {
    it('无 @ResponseStatus 注解时 responseStatus 保持 undefined', () => {
      const factory = createMockFactory();
      const original = new HandlerMethod(TestController, TestController.prototype.noArg, factory);
      // 无注解 → evaluateResponseStatus 不设置值
      expect(original.responseStatus).toBeUndefined();
      expect(original.responseStatusReason).toBeUndefined();
    });
  });
});