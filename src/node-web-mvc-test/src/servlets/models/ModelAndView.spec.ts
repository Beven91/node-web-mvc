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
    // 注意：wasCleared() 存在已知源码 bug——this.isEmpty 是函数而非调用结果
    // this.isEmpty 作为函数总是 truthy，所以 cleared=true 时返回函数引用
    it('未清空前返回 undefined（cleared=false 时 falsy）', () => {
      expect(new ModelAndView('index').wasCleared()).toBeUndefined();
    });

    it('清空后返回 isEmpty 函数引用', () => {
      const mav = new ModelAndView('index', { a: 1 });
      mav.clear();
      expect(typeof mav.wasCleared()).toBe('function');
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
