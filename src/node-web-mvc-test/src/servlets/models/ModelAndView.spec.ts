import ModelAndView from '../../../../node-web-mvc/src/servlets/models/ModelAndView';
import HttpStatus from '../../../../node-web-mvc/src/servlets/http/HttpStatus';

describe('ModelAndView', () => {
  describe('构造', () => {
    it('默认构造', () => {
      const mav = new ModelAndView();
      expect(mav.view).toBeUndefined();
      expect(mav.model).toBeUndefined();
      expect(mav.status).toBeUndefined();
    });

    it('view 构造', () => {
      const mav = new ModelAndView('index');
      expect(mav.view).toBe('index');
    });

    it('view + model + status 构造', () => {
      const mav = new ModelAndView('index', { name: 'tom' }, HttpStatus.OK);
      expect(mav.view).toBe('index');
      expect(mav.model).toEqual({ name: 'tom' });
      expect(mav.status).toBe(HttpStatus.OK);
    });

    it('支持 View 对象作为 view', () => {
      const view = { render: () => {} };
      const mav = new ModelAndView(view as any);
      expect(mav.view).toBe(view);
    });
  });

  describe('isEmpty', () => {
    it('view 和 model 都为空时 true', () => {
      expect(new ModelAndView().isEmpty()).toBe(true);
    });

    it('有 view 时 false', () => {
      expect(new ModelAndView('index').isEmpty()).toBe(false);
    });

    it('有 model 时 false', () => {
      expect(new ModelAndView(undefined, { a: 1 }).isEmpty()).toBe(false);
    });
  });

  describe('wasCleared', () => {
    // BUG：wasCleared() 中 this.isEmpty 是方法引用而非调用结果
    // return this.cleared && this.isEmpty;
    // this.isEmpty 作为函数引用始终 truthy
    it('未清空前（cleared=undefined）返回 undefined（falsy）', () => {
      expect(new ModelAndView('index').wasCleared()).toBeUndefined();
    });

    it('清空后返回的是 isEmpty 函数引用而非布尔值', () => {
      const mav = new ModelAndView('index', { a: 1 });
      mav.clear();
      const result = mav.wasCleared();
      // BUG: 应返回 true，但实际返回 isEmpty 函数
      expect(typeof result).toBe('function');
      // 因为 this.isEmpty 是函数引用，始终 truthy
      // cleared=true && function → function (truthy 但不是 boolean)
      expect(result).toBeTruthy();
    });

    it('bug 影响：wasCleared() 永远不会返回 false（因为函数引用始终 truthy）', () => {
      const mav = new ModelAndView();
      mav.clear();
      // 即使 model 非空（被 clear 设为 null），wasCleared 仍返回函数引用
      const result = mav.wasCleared();
      expect(result).toBeTruthy();
      expect(typeof result).toBe('function');
    });
  });

  describe('clear', () => {
    it('清空 view/model', () => {
      const mav = new ModelAndView('index', { a: 1 });
      mav.clear();
      expect(mav.view).toBeUndefined();
      expect(mav.model).toBeNull();
      expect(mav.isEmpty()).toBe(true);
    });
  });

  describe('addObject', () => {
    it('model 为空时自动初始化并添加', () => {
      const mav = new ModelAndView('index');
      mav.addObject('name', 'tom');
      expect(mav.model).toEqual({ name: 'tom' });
    });

    it('已有 model 时追加属性', () => {
      const mav = new ModelAndView('index', { a: 1 });
      mav.addObject('b', 2);
      expect(mav.model).toEqual({ a: 1, b: 2 });
    });
  });
});
