import RequestMappingInfo, { ensureArray } from '../../../../node-web-mvc/src/servlets/mapping/RequestMappingInfo';

describe('RequestMappingInfo', () => {
  describe('ensureArray', () => {
    it('数组原样返回', () => {
      expect(ensureArray([ 'a', 'b' ])).toEqual([ 'a', 'b' ]);
    });

    it('非数组包装为数组', () => {
      expect(ensureArray('a')).toEqual([ 'a' ]);
    });

    it('过滤 falsy 值', () => {
      expect(ensureArray(undefined)).toEqual([]);
      expect(ensureArray(null)).toEqual([]);
      expect(ensureArray('')).toEqual([]);
      expect(ensureArray(0)).toEqual([]);
      expect(ensureArray(false)).toEqual([]);
    });

    it('数组内的 falsy 也会被保留（不递归过滤）', () => {
      expect(ensureArray([ null, 'a' ])).toEqual([ null, 'a' ]);
    });
  });

  describe('create', () => {
    it('已是 RequestMappingInfo 实例则原样返回', () => {
      const info = new RequestMappingInfo('/user', 'GET', [], undefined, undefined, []);
      expect(RequestMappingInfo.create(info, 'POST')).toBe(info);
    });

    it('字符串路径', () => {
      const info = RequestMappingInfo.create('/user', 'GET');
      expect(info.value).toEqual([ '/user' ]);
      expect(info.method.GET).toBe(true);
      expect(info.method.POST).toBeUndefined();
    });

    it('对象形式配置', () => {
      const info = RequestMappingInfo.create({
        value: [ '/a', '/b' ],
        produces: [ 'application/json' ],
        consumes: [ 'application/json' ],
        params: { id: '1' },
        headers: { 'x-token': 'abc' },
      }, 'POST');
      expect(info.value).toEqual([ '/a', '/b' ]);
      expect(info.method.POST).toBe(true);
      expect(info.produces).toEqual([ 'application/json' ]);
      expect(info.consumes).toEqual([ 'application/json' ]);
      expect(info.params).toEqual({ id: '1' });
      expect(info.headers).toEqual({ 'x-token': 'abc' });
    });

    it('空值创建', () => {
      const info = RequestMappingInfo.create(null, undefined);
      expect(info.value).toEqual([]);
    });
  });

  describe('构造', () => {
    it('默认方法为全部 HTTP 方法', () => {
      const info = new RequestMappingInfo('/user', undefined, [], undefined, undefined, []);
      expect(info.method.GET).toBe(true);
      expect(info.method.POST).toBe(true);
      expect(info.method.DELETE).toBe(true);
      expect(info.method.PUT).toBe(true);
      expect(info.method.PATCH).toBe(true);
      expect(info.method.OPTIONS).toBe(true);
    });

    it('方法数组注册且大小写不敏感', () => {
      const info = new RequestMappingInfo('/user', [ 'get', 'post' ] as any, [], undefined, undefined, []);
      expect(info.method.GET).toBe(true);
      expect(info.method.POST).toBe(true);
    });

    it('单方法字符串', () => {
      const info = new RequestMappingInfo('/user', 'PATCH', [], undefined, undefined, []);
      expect(info.method.PATCH).toBe(true);
    });

    it('多值 value/produces/consumes 场景', () => {
      const info = new RequestMappingInfo(
        [ '/v1', '/v2' ],
        'GET',
        [ 'application/json', 'text/html' ],
        { id: '1' },
        { 'x-api': 'v1' },
        [ 'application/json', 'application/xml' ],
      );
      expect(info.value).toEqual([ '/v1', '/v2' ]);
      expect(info.produces).toEqual([ 'application/json', 'text/html' ]);
      expect(info.consumes).toEqual([ 'application/json', 'application/xml' ]);
    });

    it('params/headers 默认空对象', () => {
      const info = new RequestMappingInfo('/user', 'GET', [], undefined, undefined, []);
      expect(info.params).toEqual({});
      expect(info.headers).toEqual({});
    });
  });
});
