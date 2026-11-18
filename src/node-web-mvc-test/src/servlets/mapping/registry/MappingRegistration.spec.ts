import MappingRegistration from '../../../../../node-web-mvc/src/servlets/mapping/registry/MappingRegistration';
import HandlerMethod from '../../../../../node-web-mvc/src/servlets/method/HandlerMethod';

describe('MappingRegistration', () => {
  it('构造并获取 mapping/handlerMethod/mappingName', () => {
    const handler = { fn: () => {} };
    const mapping = { path: '/user' };
    const reg = new MappingRegistration(mapping, handler as any, 'userMapping');
    expect(reg.getMapping()).toBe(mapping);
    expect(reg.getHandlerMethod()).toBe(handler);
    expect(reg.getMappingName()).toBe('userMapping');
  });

  it('支持真实 HandlerMethod 实例', () => {
    class UserController {
      index() {
        return 'hello';
      }
    }
    const handlerMethod = new HandlerMethod(UserController, UserController.prototype.index);
    const reg = new MappingRegistration({ value: '/user' }, handlerMethod, 'name');
    expect(reg.getHandlerMethod()).toBe(handlerMethod);
    expect(reg.getHandlerMethod()).toBeInstanceOf(HandlerMethod);
  });
});
