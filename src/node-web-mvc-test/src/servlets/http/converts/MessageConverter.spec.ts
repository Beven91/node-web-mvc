import MessageConverter from '../../../../../node-web-mvc/src/servlets/http/converts/MessageConverter';
import AbstractHttpMessageConverter from '../../../../../node-web-mvc/src/servlets/http/converts/AbstractHttpMessageConverter';
import MediaType from '../../../../../node-web-mvc/src/servlets/http/MediaType';
import ServletContext from '../../../../../node-web-mvc/src/servlets/http/ServletContext';
import HttpMediaTypeNotSupportedException from '../../../../../node-web-mvc/src/errors/HttpMediaTypeNotSupportedException';

class StringConverter extends AbstractHttpMessageConverter<string> {
  constructor() {
    super(MediaType.TEXT_PLAIN, MediaType.APPLICATION_JSON);
  }

  supports(clazz: Function): boolean {
    return clazz === String;
  }

  async readInternal(ctx: ServletContext, type: Function): Promise<string> {
    return 'hello';
  }

  async writeInternal(data: string, ctx: ServletContext): Promise<void> {
    ctx.response.end(data);
  }
}

class IntConverter extends AbstractHttpMessageConverter<number> {
  constructor() {
 super(MediaType.APPLICATION_JSON);
}
  supports(clazz: Function): boolean {
 return clazz === Number;
}
  async readInternal(ctx: ServletContext, type: Function): Promise<number> {
 return 42;
}
  async writeInternal(data: number, ctx: ServletContext): Promise<void> {}
}

function makeCtx(method: string = 'POST', mediaType?: MediaType, readableLength: number = 10) {
  return {
    request: {
      method,
      mediaType: mediaType || MediaType.TEXT_PLAIN,
      nativeRequest: { readableLength },
    },
    response: { end: jest.fn() },
  } as unknown as ServletContext;
}

describe('AbstractHttpMessageConverter', () => {
  it('matchMediaType(null) 返回 true', () => {
    const conv = new StringConverter();
    expect(conv['matchMediaType'](null)).toBe(true);
  });

  it('canRead/canWrite 综合 supports 和 mediaType', () => {
    const conv = new StringConverter();
    expect(conv.canRead(String, MediaType.TEXT_PLAIN)).toBe(true);
    expect(conv.canRead(Number, MediaType.TEXT_PLAIN)).toBe(false);
    expect(conv.canRead(String, MediaType.APPLICATION_XML)).toBe(false);
  });

  it('getSupportedMediaTypes', () => {
    const conv = new StringConverter();
    expect(conv.getSupportedMediaTypes()).toContain(MediaType.TEXT_PLAIN);
    expect(conv.getSupportedMediaTypes()).toContain(MediaType.APPLICATION_JSON);
  });
});

describe('MessageConverter', () => {
  describe('addMessageConverters / forEach', () => {
    it('注册和遍历转换器', () => {
      const mc = new MessageConverter();
      const c1 = new StringConverter();
      const c2 = new IntConverter();
      mc.addMessageConverters(c1, c2);
      const visited: Function[] = [];
      mc.forEach((c: any) => visited.push(c.supports));
      expect(visited).toHaveLength(2);
    });
  });

  describe('read', () => {
    it('支持的类型读取成功', async() => {
      const mc = new MessageConverter();
      mc.addMessageConverters(new StringConverter());
      const ctx = makeCtx('POST');
      const result = await mc.read(ctx, String);
      expect(result).toBe('hello');
    });

    it('method 不在 POST/PUT/PATCH 且无匹配 converter 且无 body 返回 null', async() => {
      const mc = new MessageConverter();
      mc.addMessageConverters(new IntConverter());
      const ctx = makeCtx('GET', MediaType.APPLICATION_JSON, 0);
      const result = await mc.read(ctx, String);
      expect(result).toBeNull();
    });

    it('有匹配的 converter 时优先使用', async() => {
      const mc = new MessageConverter();
      mc.addMessageConverters(new StringConverter());
      const ctx = makeCtx('PUT');
      const result = await mc.read(ctx, String);
      expect(result).toBe('hello');
    });

    it('无可匹配 converter 时抛 HttpMediaTypeNotSupported', async() => {
      const mc = new MessageConverter();
      mc.addMessageConverters(new IntConverter());
      const ctx = makeCtx('POST');
      await expect(mc.read(ctx, String)).rejects.toThrow(HttpMediaTypeNotSupportedException);
    });
  });

  describe('write', () => {
    it('匹配的 converter 写出', async() => {
      const mc = new MessageConverter();
      const c = new StringConverter();
      mc.addMessageConverters(c);
      const ctx = makeCtx();
      await mc.write('world', MediaType.TEXT_PLAIN, ctx);
      expect(ctx.response.end).toHaveBeenCalledWith('world');
    });

    it('无匹配 converter 返回 undefined', async() => {
      const mc = new MessageConverter();
      mc.addMessageConverters(new IntConverter());
      const ctx = makeCtx();
      const result = await mc.write('world', MediaType.TEXT_PLAIN, ctx);
      expect(result).toBeUndefined();
    });
  });
});
